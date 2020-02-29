import { mat4, mat3 } from 'gl-matrix';
import WebGL2Utils from './webgl-2-utils';
import ShaderRegistry from './shader-registry';

const vec3Cache = {
    direction: [],
    ambientColor: [],
    diffuseColor: [],
    specularColor: [],
};

const getLightValuesAsFlatArray = (lights, propertyName) => {
    let idx = 0;
    for (let i = 0; i < lights.length; i++) {
        vec3Cache[propertyName][idx] = lights[i][propertyName][0];
        vec3Cache[propertyName][idx + 1] = lights[i][propertyName][1];
        vec3Cache[propertyName][idx + 2] = lights[i][propertyName][2];
        idx += 3;
    }

    return vec3Cache[propertyName];
};

const propertyNameMappings = {
    dirLight: {
        'dirLightDirection[0]': 'direction',
        'dirLightAmbientColor[0]': 'ambientColor',
        'dirLightDiffuseColor[0]': 'diffuseColor',
        'dirLightSpecularColor[0]': 'specularColor',
        dirLightCount: 'length',
    },
    camera: {
        cameraPosition: 'position',
    },
};

const mat4Identity = () => mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
const mat3Identity = () => mat3.fromValues(1, 0, 0, 0, 1, 0, 0, 0, 1);

const modelViewMatrix = mat4Identity();
const normalMatrix = mat3Identity();

const isTransformUniform = (name) => ['modelMatrix'].includes(name);

const isCameraUniform = (name) => ['cameraPosition', 'projectionMatrix'].includes(name);

const isCameraTransformUniform = (name) => ['modelViewMatrix', 'normalMatrix'].includes(name);

const isDirLightUniform = (name) => Object.keys(propertyNameMappings.dirLight).includes(name);

const isMaterialUniform = (name) => [
    'diffuseColor',
    'specularColor',
    'ambientIntensity',
    'specularShininess',
    'diffuseMap',
    'specularMap',
    'opacity',
].includes(name);

const CachedRenderable = class {
    constructor(gl, camera, dirLights, transform, renderable, globalWebglState, webglUniformTypeToUniformType) {
        console.log('new cached renderable');
        this.gl = gl;
        this.camera = camera;
        this.dirLights = dirLights;
        this.transform = transform;
        this.renderable = renderable;
        this.globalWebglState = globalWebglState;
        this.webglUniformTypeToUniformType = webglUniformTypeToUniformType;

        const vertexShaderSource = ShaderRegistry.getVertexShader(renderable);
        const fragmentShaderSource = ShaderRegistry.getFragmentShader(renderable);

        this.vertexShader = WebGL2Utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        this.fragmentShader = WebGL2Utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = WebGL2Utils.createProgram(gl, this.vertexShader, this.fragmentShader);

        const result = WebGL2Utils.createVertexArray(gl, renderable.geometry);
        this.positionBuffer = result.positionBuffer;
        this.uvBuffer = result.uvBuffer;
        this.normalBuffer = result.normalBuffer;
        this.colorBuffer = result.colorBuffer;
        this.vao = result.vertexArray;

        this.indices = WebGL2Utils.createElementArrayBuffer(gl, renderable.geometry);

        this.lastDirLightCount = 0;
        this.needsCacheBust = true;

        this.textures = {};

        this.uniforms = {
            transform: [],
            camera: [],
            cameraTransform: [],
            material: [],
            dirLights: [],
        };

        const activeUniformsCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < activeUniformsCount; i++) {
            const uniformInfo = this.gl.getActiveUniform(this.program, i);
            const type = this.webglUniformTypeToUniformType[uniformInfo.type];
            const location = this.gl.getUniformLocation(this.program, uniformInfo.name);

            if (type === 'sampler2D') {
                this.textures[uniformInfo.name] = WebGL2Utils.createTexture(this.gl, this.renderable.material[uniformInfo.name]);
            }

            if (isTransformUniform(uniformInfo.name)) {
                this.uniforms.transform.push({ name: uniformInfo.name, type, location });
            }
            if (isCameraUniform(uniformInfo.name)) {
                this.uniforms.camera.push({ name: uniformInfo.name, type, location });
            }
            if (isCameraTransformUniform(uniformInfo.name)) {
                this.uniforms.cameraTransform.push({ name: uniformInfo.name, type, location });
            }
            if (isMaterialUniform(uniformInfo.name)) {
                this.uniforms.material.push({ name: uniformInfo.name, type, location });
            }
            if (isDirLightUniform(uniformInfo.name)) {
                this.uniforms.dirLights.push({ name: uniformInfo.name, type, location });
            }
        }
    }

    draw(dirLights) {
        const gl = this.gl; // eslint-disable-line prefer-destructuring

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        this.globalWebglState.setBlendEnabled(this.renderable.material.opacity < 1);

        let textureIndex = 0;

        let normalMatrixNeedsUpdate = false;
        for (let i = 0; i < this.uniforms.cameraTransform.length; i++) {
            const uniform = this.uniforms.cameraTransform[i];
            const modelMatrixNeedsUpdate = this.transform.getUniformUpdateFlag('modelMatrix');
            const viewMatrixNeedsUpdate = this.camera.getUniformUpdateFlag('viewMatrix');

            if (uniform.name === 'modelViewMatrix' && (this.needsCacheBust || modelMatrixNeedsUpdate || viewMatrixNeedsUpdate)) {
                mat4.multiply(modelViewMatrix, this.camera.viewMatrix, this.transform.modelMatrix);
                // console.log('cameraTransform update', uniform.name);
                WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, modelViewMatrix);
                normalMatrixNeedsUpdate = true;
            }
            if (uniform.name === 'normalMatrix' && (this.needsCacheBust || normalMatrixNeedsUpdate)) {
                mat3.normalFromMat4(normalMatrix, modelViewMatrix);
                // console.log('cameraTransform update', uniform.name);
                WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, normalMatrix);
            }
        }

        for (let i = 0; i < this.uniforms.transform.length; i++) {
            const uniform = this.uniforms.transform[i];
            if (this.needsCacheBust || this.transform.getUniformUpdateFlag(uniform.name)) {
                const value = this.transform[uniform.name];
                // console.log('transform update', uniform.name);
                WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, value);
                this.transform.setUniformUpdateFlag(uniform.name, false);
            }
        }

        for (let i = 0; i < this.uniforms.camera.length; i++) {
            const uniform = this.uniforms.camera[i];
            const cameraPropertyName = propertyNameMappings.camera[uniform.name] || uniform.name;
            if (this.needsCacheBust || this.camera.getUniformUpdateFlag(cameraPropertyName)) {
                const value = this.camera[cameraPropertyName];
                // console.log('camera update', uniform.name);
                WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, value);
            }
        }

        for (let i = 0; i < this.uniforms.material.length; i++) {
            const uniform = this.uniforms.material[i];

            if (uniform.type === 'sampler2D') {
                gl.activeTexture(gl.TEXTURE0 + textureIndex);
                gl.bindTexture(gl.TEXTURE_2D, this.textures[uniform.name]);
                textureIndex++;
            }

            if (this.needsCacheBust || this.renderable.material.getUniformUpdateFlag(uniform.name)) {
                const value = this.renderable.material[uniform.name];
                // console.log('material update', uniform.name, value);
                WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, value);
                this.renderable.material.setUniformUpdateFlag(uniform.name, false);
            }
        }

        for (let i = 0; i < this.uniforms.dirLights.length; i++) {
            const uniform = this.uniforms.dirLights[i];
            const propertyName = propertyNameMappings.dirLight[uniform.name];
            if (propertyName === 'length') {
                if (this.needsCacheBust || this.lastDirLightCount !== dirLights.length) {
                    // console.log('dirlight length update', dirLights.length);
                    WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, dirLights.length);
                    this.lastDirLightCount = dirLights.length;
                }
            } else {
                const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag(propertyName));
                if (this.needsCacheBust || needsUpdate) {
                    const value = getLightValuesAsFlatArray(dirLights, propertyName);
                    // console.log('dirLights update', uniform.name);
                    WebGL2Utils.uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, value);
                }
            }
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
        gl.drawElements(gl.TRIANGLES, this.renderable.geometry.indices.length, gl.UNSIGNED_INT, 0);
        this.needsCacheBust = false;
    }

    cleanup() {
        this.gl.deleteShader(this.vertexShader);
        this.gl.deleteShader(this.fragmentShader);
        this.gl.deleteProgram(this.program);
        if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
        if (this.uvBuffer) this.gl.deleteBuffer(this.uvBuffer);
        if (this.normalBuffer) this.gl.deleteBuffer(this.normalBuffer);
        if (this.colorBuffer) this.gl.deleteBuffer(this.colorBuffer);
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.indices);
    }
};

export default CachedRenderable;
