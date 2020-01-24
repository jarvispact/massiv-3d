/* eslint-disable no-console, no-bitwise, prefer-destructuring */

import { mat4, mat3 } from 'gl-matrix';
import WebGLUtils from './webgl-utils';
import ShaderBuilder from './shader-builder';
import Uniform from './uniform';

const getRenderables = (componentsByType, componentsByEntityId) => componentsByType.STANDARD_MATERIAL.map(m => ({
    id: m.entityId,
    material: m,
    geometry: componentsByEntityId[m.entityId].find(c => c.type === 'GEOMETRY'),
    transform: componentsByEntityId[m.entityId].find(c => c.type === 'TRANSFORM_3D'),
}));

const getActiveCamera = (componentsByType) => componentsByType.PERSPECTIVE_CAMERA[0];

const getDirectionalLights = (componentsByType) => componentsByType.DIRECTIONAL_LIGHT;

const getLightValuesAsFlatArray = (lights, propertyName) => {
    const flatValues = [];
    for (let i = 0; i < lights.length; i++) flatValues.push(...lights[i][propertyName]);
    return flatValues;
};

class WebGL2Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.gl = this.canvas.getContext('webgl2');
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);

        this.webglUniformTypeToUniformType = WebGLUtils.createUniformTypeLookupTable(this.gl);
        this.renderableCache = {};
    }

    resize() {
        const c = this.gl.canvas;
        const w = c.clientWidth;
        const h = c.clientHeight;

        if (c.width !== w || c.height !== h) {
            c.width = w;
            c.height = h;
            this.gl.viewport(0, 0, c.width, c.height);
        }
    }

    cacheRenderable(renderable) {
        const gl = this.gl;
        const shaderData = ShaderBuilder[renderable.material.type].buildShader(renderable.material);

        const vertexShader = WebGLUtils.createShader(gl, gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        const shader = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);

        const activeUniformsCount = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS);
        const uniforms = [];
        const textures = {};

        const textureLookupTable = {
            diffuseMap: renderable.material.diffuseMap,
            specularMap: renderable.material.specularMap,
        };

        for (let u = 0; u < activeUniformsCount; u++) {
            const uniformInfo = gl.getActiveUniform(shader, u);
            const uniformLocation = gl.getUniformLocation(shader, uniformInfo.name);
            const uniformType = this.webglUniformTypeToUniformType[uniformInfo.type];
            uniforms.push(new Uniform(gl, uniformLocation, uniformInfo.name, uniformType));

            if (this.webglUniformTypeToUniformType[uniformInfo.type] === 'sampler2D') {
                textures[uniformInfo.name] = WebGLUtils.createTexture(gl, textureLookupTable[uniformInfo.name]);
            }
        }

        const cachedRenderable = {
            vao: WebGLUtils.createVertexArray(gl, renderable.geometry),
            indices: WebGLUtils.createElementArrayBuffer(gl, renderable.material),
            shader,
            uniforms,
            textures,
        };

        this.renderableCache[renderable.id] = cachedRenderable;
        return cachedRenderable;
    }

    render(world) {
        this.resize();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderables = getRenderables(world.componentsByType, world.componentsByEntityId);
        const activeCamera = getActiveCamera(world.componentsByType);
        const directionalLights = getDirectionalLights(world.componentsByType);

        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const cachedRenderable = this.renderableCache[renderable.id] || this.cacheRenderable(renderable);

            this.gl.bindVertexArray(cachedRenderable.vao);
            this.gl.useProgram(cachedRenderable.shader);

            const mv = mat4.multiply(mat4.create(), activeCamera.viewMatrix, renderable.transform.modelMatrix);
            const mvp = mat4.multiply(mat4.create(), activeCamera.projectionMatrix, mv);
            const normalMatrix = mat3.normalFromMat4(mat3.create(), mv);

            const uniformValueLookupTable = {
                modelMatrix: renderable.transform.modelMatrix,
                normalMatrix,
                mv,
                mvp,
                diffuseColor: renderable.material.diffuseColor,
                specularColor: renderable.material.specularColor,
                ambientIntensity: renderable.material.ambientIntensity,
                specularExponent: renderable.material.specularExponent,
                specularShininess: renderable.material.specularShininess,
                cameraPosition: activeCamera.position,
                'dirLightDirection[0]': getLightValuesAsFlatArray(directionalLights, 'direction'),
                'dirLightAmbientColor[0]': getLightValuesAsFlatArray(directionalLights, 'ambientColor'),
                'dirLightDiffuseColor[0]': getLightValuesAsFlatArray(directionalLights, 'diffuseColor'),
                'dirLightSpecularColor[0]': getLightValuesAsFlatArray(directionalLights, 'specularColor'),
                numDirLights: directionalLights.length,
            };

            let textureIndex = 0;
            for (let u = 0; u < cachedRenderable.uniforms.length; u++) {
                const uniform = cachedRenderable.uniforms[u];
                const uniformValue = uniformValueLookupTable[uniform.name];

                // TODO: do we need to call it every frame or only when texture changes ?
                if (uniform.type === 'sampler2D') {
                    this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, cachedRenderable.textures[uniform.name]);
                    uniform.update(textureIndex);
                    textureIndex++;
                } else {
                    uniform.update(uniformValue);
                }
            }

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cachedRenderable.indices);
            this.gl.drawElements(this.gl.TRIANGLES, renderable.material.indices.length, this.gl.UNSIGNED_INT, 0);
        }
    }
}

export default WebGL2Renderer;
