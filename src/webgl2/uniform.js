import { mat4, mat3 } from 'gl-matrix';
import WebGL2Utils from './webgl-2-utils';

const U = WebGL2Utils.UNIFORM;

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
    let lastDirLightCount = 0;

    return {
        [U.MODEL_MATRIX.NAME]: (_, transform) => {
            if (!forceUniformUpdate && !transform.getUniformUpdateFlag('modelMatrix')) return null;
            // console.log('modelMatrix');
            return transform.modelMatrix;
        },
        [U.MODEL_VIEW_MATRIX.NAME]: (_, transform, camera) => {
            if (!forceUniformUpdate && !transform.getUniformUpdateFlag('modelMatrix') && !camera.getUniformUpdateFlag('viewMatrix')) return null;
            // console.log('modelViewMatrix');
            mat4.multiply(modelViewMatrixCache, camera.viewMatrix, transform.modelMatrix);
            return modelViewMatrixCache;
        },
        [U.NORMAL_MATRIX.NAME]: (_, transform, camera) => {
            if (!forceUniformUpdate && !transform.getUniformUpdateFlag('modelMatrix') && !camera.getUniformUpdateFlag('viewMatrix')) return null;
            // console.log('normalMatrix');
            mat3.normalFromMat4(normalMatrixCache, modelViewMatrixCache);
            return normalMatrixCache;
        },
        [U.PROJECTION_MATRIX.NAME]: (_, __, camera) => {
            if (!forceUniformUpdate && !camera.getUniformUpdateFlag('projectionMatrix')) return null;
            // console.log('projectionMatrix');
            return camera.projectionMatrix;
        },
        [U.DIFFUSE_COLOR.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('diffuseColor')) return null;
            // console.log('diffuseColor');
            return renderable.material.diffuseColor;
        },
        [U.SPECULAR_COLOR.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('specularColor')) return null;
            // console.log('specularColor');
            return renderable.material.specularColor;
        },
        [U.AMBIENT_INTENSITY.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('ambientIntensity')) return null;
            // console.log('ambientIntensity');
            return renderable.material.ambientIntensity;
        },
        [U.SPECULAR_SHININESS.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('specularShininess')) return null;
            // console.log('specularShininess');
            return renderable.material.specularShininess;
        },
        [U.OPACITY.NAME]: (renderable) => {
            if (!forceUniformUpdate && !renderable.material.getUniformUpdateFlag('opacity')) return null;
            // console.log('opacity');
            return renderable.material.opacity;
        },
        [U.CAMERA_POSITION.NAME]: (_, __, camera) => {
            if (!forceUniformUpdate && !camera.getUniformUpdateFlag('position')) return null;
            // console.log('cameraPosition');
            return camera.position;
        },
        [U.DIR_LIGHT_DIRECTIONS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('direction'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightDirection');
            return getLightValuesAsFlatArray(dirLights, 'direction');
        },
        [U.DIR_LIGHT_AMBIENT_COLORS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('ambientColor'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightAmbientColor');
            return getLightValuesAsFlatArray(dirLights, 'ambientColor');
        },
        [U.DIR_LIGHT_DIFFUSE_COLORS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('diffuseColor'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightDiffuseColor');
            return getLightValuesAsFlatArray(dirLights, 'diffuseColor');
        },
        [U.DIR_LIGHT_SPECULAR_COLORS.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('specularColor'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightSpecularColor');
            return getLightValuesAsFlatArray(dirLights, 'specularColor');
        },
        [U.DIR_LIGHT_INTENSITIES.NAME]: (_, __, ___, dirLights) => {
            const needsUpdate = dirLights.some(l => l.getUniformUpdateFlag('intensity'));
            if (!forceUniformUpdate && !needsUpdate) return null;
            // console.log('dirLightIntensity');
            return dirLights.map(l => l.intensity);
        },
        [U.DIR_LIGHT_COUNT.NAME]: (_, __, ___, dirLights) => {
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
