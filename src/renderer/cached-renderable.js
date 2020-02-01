import WebGLUtils from './webgl-utils';
import ShaderBuilder from './shader-builder';
import Uniform from './uniform';

const isTransformUniform = name => name.startsWith('transform');
const isMaterialUniform = name => name.startsWith('material');
const isCameraUniform = name => name.startsWith('camera');
const isDirLightUniform = name => name.startsWith('dirLight');

const transformPropertyNameMap = {
    transformModelMatrix: 'modelMatrix',
    transformModelViewMatrix: 'modelViewMatrix',
    transformNormalMatrix: 'normalMatrix',
};

const materialPropertyNameMap = {
    materialDiffuseColor: 'diffuseColor',
    materialSpecularColor: 'specularColor',
    materialAmbientIntensity: 'ambientIntensity',
    materialSpecularExponent: 'specularExponent',
    materialSpecularShininess: 'specularShininess',
};

const cameraPropertyNameMap = {
    cameraPosition: 'position',
    cameraProjectionMatrix: 'projectionMatrix',
};

const dirLightPropertyNameMap = {
    'dirLightDirection[0]': 'direction',
    'dirLightAmbientColor[0]': 'ambientColor',
    'dirLightDiffuseColor[0]': 'diffuseColor',
    'dirLightSpecularColor[0]': 'specularColor',
    dirLightCount: 'length',
};

const vec3Cache = {
    direction: [],
    ambientColor: [],
    diffuseColor: [],
    specularColor: [],
};

// const getLightValuesAsFlatArray = (lights, propertyName) => {
//     const flatValues = [];
//     for (let i = 0; i < lights.length; i++) flatValues.push(...lights[i][propertyName]);
//     return flatValues;
// };

/* eslint-disable prefer-destructuring */
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
/* eslint-enable prefer-destructuring */

// const matrixCache = {
//     mv: mat4.create(),
//     mvp: mat4.create(),
//     normalMatrix: mat3.create(),
// };

const cameraUpdatedForRenderable = {
    0: false,
};

const lightsUpdatedForRenderable = {
    0: false,
};

class CachedRenderable {
    constructor(gl, renderable) {
        this.gl = gl;
        this.renderable = renderable;
        this.vao = WebGLUtils.createVertexArray(gl, renderable.geometry);
        this.indices = WebGLUtils.createElementArrayBuffer(gl, renderable.material);
        this.materialIndicesLength = renderable.material.indices.length;
        this.webglUniformTypeToUniformType = WebGLUtils.createUniformTypeLookupTable(this.gl);
        this.shader = this.setupShader();
        this.uniforms = this.setupUniforms();
    }

    setupShader() {
        const shaderData = ShaderBuilder[this.renderable.material.type].buildShader(this.renderable.material);
        const vertexShader = WebGLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = WebGLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        return WebGLUtils.createProgram(this.gl, vertexShader, fragmentShader);
    }

    setupUniforms() {
        const transform = [];
        const material = [];
        const camera = [];
        const dirLight = [];

        const activeUniformsCount = this.gl.getProgramParameter(this.shader, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < activeUniformsCount; i++) {
            const uniformInfo = this.gl.getActiveUniform(this.shader, i);
            const type = this.webglUniformTypeToUniformType[uniformInfo.type];
            const location = this.gl.getUniformLocation(this.shader, uniformInfo.name);

            if (isTransformUniform(uniformInfo.name)) {
                transform.push(new Uniform(this.gl, location, uniformInfo.name, type));
            }

            if (isMaterialUniform(uniformInfo.name)) {
                material.push(new Uniform(this.gl, location, uniformInfo.name, type));
            }

            if (isCameraUniform(uniformInfo.name)) {
                camera.push(new Uniform(this.gl, location, uniformInfo.name, type));
            }

            if (isDirLightUniform(uniformInfo.name)) {
                dirLight.push(new Uniform(this.gl, location, uniformInfo.name, type));
            }
        }

        return { transform, material, camera, dirLight };
    }

    use() {
        this.gl.useProgram(this.shader);
        this.gl.bindVertexArray(this.vao);
    }

    draw() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices);
        this.gl.drawElements(this.gl.TRIANGLES, this.materialIndicesLength, this.gl.UNSIGNED_INT, 0);
    }

    update(renderable, camera, dirLights) {
        const transformUniformsNeedUpdate = renderable.transform.update(camera);
        const materialUniformsNeedUpdate = renderable.material.update();
        const allLightsUpdateFlag = dirLights.map(l => l.update());
        const lightNeedsUpdate = allLightsUpdateFlag.some(d => d);
        const cameraNeedsUpdate = camera.update();

        const cameraUpdateForRenderable = cameraUpdatedForRenderable[renderable.id] ? cameraNeedsUpdate : true;
        const lightUpdateForRenderable = lightsUpdatedForRenderable[renderable.id] ? lightNeedsUpdate : true;

        if (transformUniformsNeedUpdate) {
            // console.log('transformUniformsNeedUpdate');
            for (let i = 0; i < this.uniforms.transform.length; i++) {
                const uniform = this.uniforms.transform[i];
                const propertyName = transformPropertyNameMap[uniform.name];
                uniform.update(renderable.transform[propertyName]);
            }
        }

        if (materialUniformsNeedUpdate) {
            // console.log('materialUniformsNeedUpdate');
            for (let i = 0; i < this.uniforms.material.length; i++) {
                const uniform = this.uniforms.material[i];
                const propertyName = materialPropertyNameMap[uniform.name];
                uniform.update(renderable.material[propertyName]);
            }
        }

        if (cameraUpdateForRenderable) {
            // console.log('cameraNeedsUpdate');
            for (let i = 0; i < this.uniforms.camera.length; i++) {
                const uniform = this.uniforms.camera[i];
                const propertyName = cameraPropertyNameMap[uniform.name];
                uniform.update(camera[propertyName]);
            }
            cameraUpdatedForRenderable[renderable.id] = true;
        }

        if (lightUpdateForRenderable) {
            // console.log('lightNeedsUpdate');
            for (let i = 0; i < this.uniforms.dirLight.length; i++) {
                const uniform = this.uniforms.dirLight[i];
                if (uniform.name === 'dirLightCount') {
                    uniform.update(dirLights.length);
                } else {
                    const propertyName = dirLightPropertyNameMap[uniform.name];
                    uniform.update(getLightValuesAsFlatArray(dirLights, propertyName));
                }
            }
            lightsUpdatedForRenderable[renderable.id] = true;
        }
    }
}

export default CachedRenderable;
