import { mat4, mat3 } from 'gl-matrix';
import WebGL2Utils from './webgl-2-utils';

const Uniform = class {
    constructor(gl, name, type, location, lookupTable) {
        this.gl = gl;
        this.name = name;
        this.type = type;
        this.location = location;
        this.lookupTable = lookupTable;
    }

    updateValue(renderable, transform, camera, dirLights) {
        const value = this.lookupTable[this.name](renderable, transform, camera, dirLights);
        if (value !== null) WebGL2Utils.uniformTypeToUpdateUniformFunction[this.type](this.gl, this.location, value);
    }
};

Uniform.MODEL_MATRIX = { TYPE: 'mat4', NAME: 'modelMatrix' };
Uniform.MODEL_VIEW_MATRIX = { TYPE: 'mat4', NAME: 'modelViewMatrix' };
Uniform.NORMAL_MATRIX = { TYPE: 'mat3', NAME: 'normalMatrix' };

Uniform.DIFFUSE_COLOR = { TYPE: 'vec3', NAME: 'diffuseColor' };
Uniform.SPECULAR_COLOR = { TYPE: 'vec3', NAME: 'specularColor' };
Uniform.AMBIENT_INTENSITY = { TYPE: 'float', NAME: 'ambientIntensity' };
Uniform.SPECULAR_SHININESS = { TYPE: 'float', NAME: 'specularShininess' };
Uniform.OPACITY = { TYPE: 'float', NAME: 'opacity' };

Uniform.PROJECTION_MATRIX = { TYPE: 'mat4', NAME: 'projectionMatrix' };
Uniform.CAMERA_POSITION = { TYPE: 'vec3', NAME: 'cameraPosition' };

Uniform.DIR_LIGHT_DIRECTIONS = { TYPE: 'vec3', NAME: 'dirLightDirection[0]' };
Uniform.DIR_LIGHT_AMBIENT_COLORS = { TYPE: 'vec3', NAME: 'dirLightAmbientColor[0]' };
Uniform.DIR_LIGHT_DIFFUSE_COLORS = { TYPE: 'vec3', NAME: 'dirLightDiffuseColor[0]' };
Uniform.DIR_LIGHT_SPECULAR_COLORS = { TYPE: 'vec3', NAME: 'dirLightSpecularColor[0]' };
Uniform.DIR_LIGHT_SPECULAR_INTENSITIES = { TYPE: 'float', NAME: 'dirLightIntensity[0]' };
Uniform.DIR_LIGHT_COUNT = { TYPE: 'int', NAME: 'dirLightCount' };

const modelViewMatrixCache = mat4.create();
const normalMatrixCache = mat3.create();

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

Uniform.createUniformUpdateLookupTable = () => {
    let forceUniformUpdate = true;
    let modelViewMatrixNeedsUpdate = true;
    let normalMatrixNeedsUpdate = true;
    let lastDirLightCount = 0;

    return {
        [Uniform.MODEL_MATRIX.NAME]: (_, transform) => {
            if (!forceUniformUpdate && !transform.getUniformUpdateFlag('modelMatrix')) return null;
            // console.log('modelMatrix');
            modelViewMatrixNeedsUpdate = true;
            return transform.modelMatrix;
        },
        [Uniform.MODEL_VIEW_MATRIX.NAME]: (_, transform, camera) => {
            if (!forceUniformUpdate && !modelViewMatrixNeedsUpdate && !camera.getUniformUpdateFlag('viewMatrix')) return null;
            // console.log('modelViewMatrix');
            mat4.multiply(modelViewMatrixCache, camera.viewMatrix, transform.modelMatrix);
            modelViewMatrixNeedsUpdate = false;
            normalMatrixNeedsUpdate = true;
            return modelViewMatrixCache;
        },
        [Uniform.NORMAL_MATRIX.NAME]: () => {
            if (!forceUniformUpdate && !normalMatrixNeedsUpdate) return null;
            // console.log('normalMatrix');
            mat3.normalFromMat4(normalMatrixCache, modelViewMatrixCache);
            normalMatrixNeedsUpdate = false;
            return normalMatrixCache;
        },
        [Uniform.PROJECTION_MATRIX.NAME]: (_, __, camera) => {
            if (!forceUniformUpdate && !camera.getUniformUpdateFlag('projectionMatrix')) return null;
            // console.log('projectionMatrix');
            return camera.projectionMatrix;
        },
        [Uniform.DIFFUSE_COLOR.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('diffuseColor')) return null;
            // console.log('diffuseColor');
            return renderable.material.diffuseColor;
        },
        [Uniform.SPECULAR_COLOR.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('specularColor')) return null;
            // console.log('specularColor');
            return renderable.material.specularColor;
        },
        [Uniform.AMBIENT_INTENSITY.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('ambientIntensity')) return null;
            // console.log('ambientIntensity');
            return renderable.material.ambientIntensity;
        },
        [Uniform.SPECULAR_SHININESS.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('specularShininess')) return null;
            // console.log('specularShininess');
            return renderable.material.specularShininess;
        },
        [Uniform.OPACITY.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('opacity')) return null;
            // console.log('opacity');
            return renderable.material.opacity;
        },
        [Uniform.CAMERA_POSITION.NAME]: (_, __, camera) => {
            if (!forceUniformUpdate && !camera.getUniformUpdateFlag('position')) return null;
            // console.log('cameraPosition');
            return camera.position;
        },
        [Uniform.DIR_LIGHT_DIRECTIONS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('direction'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightDirection');
            return getLightValuesAsFlatArray(dirLights, 'direction');
        },
        [Uniform.DIR_LIGHT_AMBIENT_COLORS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('ambientColor'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightAmbientColor');
            return getLightValuesAsFlatArray(dirLights, 'ambientColor');
        },
        [Uniform.DIR_LIGHT_DIFFUSE_COLORS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('diffuseColor'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightDiffuseColor');
            return getLightValuesAsFlatArray(dirLights, 'diffuseColor');
        },
        [Uniform.DIR_LIGHT_SPECULAR_COLORS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('specularColor'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightSpecularColor');
            return getLightValuesAsFlatArray(dirLights, 'specularColor');
        },
        [Uniform.DIR_LIGHT_SPECULAR_INTENSITIES.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('intensity'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightIntensity');
            return dirLights.map(l => l.intensity);
        },
        [Uniform.DIR_LIGHT_COUNT.NAME]: (_, __, ___, dirLights) => {
            if (!forceUniformUpdate && lastDirLightCount === dirLights.length) return null;
            // console.log('dirLightCount');
            return dirLights.length;
        },
        forceUpdate: () => {
            forceUniformUpdate = true;
        },
        markRenderableAsUpdated: (renderable, transform) => {
            renderable.material.markUniformsAsUpdated();
            transform.markUniformsAsUpdated();
        },
        markFrameAsUpdated: (camera, dirLights) => {
            camera.markUniformsAsUpdated();
            dirLights.forEach(l => l.markUniformsAsUpdated());
            lastDirLightCount = dirLights.length;
            forceUniformUpdate = false;
        },
    };
};

export default Uniform;
