/* eslint-disable no-console, no-bitwise, prefer-destructuring */

import Mat3 from '../math/mat3';
import WebGLUtils from './webgl-utils';
import ShaderBuilder from './shader-builder';
import Geometry from '../components/geometry';
import Transform3D from '../components/transform-3d';
import Uniform from './uniform';

const setCanvasStyle = (canvas) => {
    canvas.style.position = 'relative';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
};

const getRenderables = (componentsByType, componentsByEntityId) => componentsByType.MATERIAL.map(m => ({
    id: m.getEntityId(),
    material: m,
    geometry: componentsByEntityId[m.getEntityId()].find(c => c instanceof Geometry),
    transform: componentsByEntityId[m.getEntityId()].find(c => c instanceof Transform3D),
}));

const getActiveCamera = (componentsByType, componentsByEntityId) => {
    const camera = componentsByType.CAMERA[0];
    return {
        camera,
        transform: componentsByEntityId[camera.getEntityId()].find(c => c instanceof Transform3D),
    };
};

const getDirectionalLights = (componentsByType) => componentsByType.DIRECTIONAL_LIGHT;

const getLightValuesAsFlatArray = (lights, propertyName) => lights.flatMap(l => l[propertyName].getAsArray());

class WebGL2Renderer {
    constructor(domNode) {
        this.domNode = domNode;
        this.canvas = document.createElement('canvas');
        this.domNode.appendChild(this.canvas);
        this.canvas.width = this.domNode.clientWidth;
        this.canvas.height = this.domNode.clientHeight;
        setCanvasStyle(this.canvas);

        this.gl = this.canvas.getContext('webgl2');
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);

        this.renderableCache = {};
    }

    resize() {
        const w = this.domNode.clientWidth;
        const h = this.domNode.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    cacheRenderable(renderable) {
        const gl = this.gl;
        const materialClassName = renderable.material.constructor.name;
        const shaderData = ShaderBuilder[materialClassName].buildShader();

        const vertexShader = WebGLUtils.createShader(gl, gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        const shader = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);

        const activeUniformsCount = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS);
        const uniforms = [];

        for (let u = 0; u < activeUniformsCount; u++) {
            const uniformInfo = gl.getActiveUniform(shader, u);
            const uniformLocation = gl.getUniformLocation(shader, uniformInfo.name);
            uniforms.push(new Uniform(gl, uniformLocation, uniformInfo.name, uniformInfo.type));
        }

        const cachedRenderable = {
            vao: WebGLUtils.createVertexArray(gl, renderable.geometry),
            indices: WebGLUtils.createElementArrayBuffer(gl, renderable.material),
            shader,
            uniforms,
        };

        this.renderableCache[renderable.id] = cachedRenderable;
        return cachedRenderable;
    }

    render(world) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderables = getRenderables(world.componentsByType, world.componentsByEntityId);
        const activeCamera = getActiveCamera(world.componentsByType, world.componentsByEntityId);
        const directionalLights = getDirectionalLights(world.componentsByType);

        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const cachedRenderable = this.renderableCache[renderable.id] || this.cacheRenderable(renderable);

            this.gl.bindVertexArray(cachedRenderable.vao);
            this.gl.useProgram(cachedRenderable.shader);

            const mv = activeCamera.camera.viewMatrix.clone().multiply(renderable.transform.modelMatrix);
            const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);

            const uniformValueLookupTable = {
                modelMatrix: renderable.transform.modelMatrix.getAsArray(),
                normalMatrix: normalMatrix.getAsArray(),
                mv: mv.getAsArray(),
                mvp: mvp.getAsArray(),
                diffuseColor: renderable.material.diffuseColor.getAsArray(),
                specularColor: renderable.material.specularColor.getAsArray(),
                ambientIntensity: renderable.material.ambientIntensity,
                specularExponent: renderable.material.specularExponent,
                specularShininess: renderable.material.specularShininess,
                cameraPosition: activeCamera.transform.position.getAsArray(),
                'dirLightDirection[0]': getLightValuesAsFlatArray(directionalLights, 'direction'),
                'dirLightAmbientColor[0]': getLightValuesAsFlatArray(directionalLights, 'ambientColor'),
                'dirLightDiffuseColor[0]': getLightValuesAsFlatArray(directionalLights, 'diffuseColor'),
                'dirLightSpecularColor[0]': getLightValuesAsFlatArray(directionalLights, 'specularColor'),
                numDirLights: directionalLights.length,
            };

            for (let u = 0; u < cachedRenderable.uniforms.length; u++) {
                const uniform = cachedRenderable.uniforms[u];
                const uniformValue = uniformValueLookupTable[uniform.name];
                uniform.update(uniformValue);
            }

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cachedRenderable.indices);
            this.gl.drawElements(this.gl.TRIANGLES, renderable.material.indices.length, this.gl.UNSIGNED_INT, 0);
        }
    }
}

export default WebGL2Renderer;
