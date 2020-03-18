import { mat4, mat3 } from 'gl-matrix';
import WebGL2Utils from './webgl-2-utils';

const U = WebGL2Utils.UNIFORM;

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

// TODO: FrameState (modelViewMatrixCache, normalMatrixCache)
// TODO: debug dynamic renderable uniform update

const Uniform = class {
    constructor(gl, name, type, location) {
        this.gl = gl;
        this.name = name;
        this.type = type;
        this.location = location;
        this.lastDirLightsCount = 0; // TODO: remove this
    }

    updateValue(cachedRenderable, camera, dirLights) {
        const transform = cachedRenderable.transform;
        const material = cachedRenderable.renderable.material;
        let value = null;

        // TRANSFORM

        if (this.name === U.MODEL_MATRIX.NAME && transform.getUniformUpdateFlag('modelMatrix')) {
            value = transform.modelMatrix;
        }

        if (this.name === U.MODEL_VIEW_MATRIX.NAME && (transform.getUniformUpdateFlag('modelMatrix') || camera.getUniformUpdateFlag('viewMatrix'))) {
            mat4.multiply(modelViewMatrixCache, camera.viewMatrix, transform.modelMatrix);
            value = modelViewMatrixCache;
        }

        if (this.name === U.NORMAL_MATRIX.NAME && (transform.getUniformUpdateFlag('modelMatrix') || camera.getUniformUpdateFlag('viewMatrix'))) {
            mat3.normalFromMat4(normalMatrixCache, modelViewMatrixCache);
            value = normalMatrixCache;
        }

        // CAMERA

        if (this.name === U.PROJECTION_MATRIX.NAME && camera.getUniformUpdateFlag('projectionMatrix')) {
            value = camera.projectionMatrix;
        }

        if (this.name === U.CAMERA_POSITION.NAME && camera.getUniformUpdateFlag('position')) {
            value = camera.position;
        }

        // MATERIAL

        if (this.name === U.DIFFUSE_COLOR.NAME && material.getUniformUpdateFlag('diffuseColor')) {
            value = material.diffuseColor;
        }

        if (this.name === U.SPECULAR_COLOR.NAME && material.getUniformUpdateFlag('specularColor')) {
            value = material.specularColor;
        }

        if (this.name === U.AMBIENT_INTENSITY.NAME && material.getUniformUpdateFlag('ambientIntensity')) {
            value = material.ambientIntensity;
        }

        if (this.name === U.SPECULAR_SHININESS.NAME && material.getUniformUpdateFlag('specularShininess')) {
            value = material.specularShininess;
        }

        if (this.name === U.OPACITY.NAME && material.getUniformUpdateFlag('opacity')) {
            value = material.opacity;
        }

        // DIRECTIONAL LIGHT

        if (this.name === U.DIR_LIGHT_DIRECTIONS.NAME && dirLights.some(l => l.getUniformUpdateFlag('direction'))) {
            value = getLightValuesAsFlatArray(dirLights, 'direction');
        }

        if (this.name === U.DIR_LIGHT_AMBIENT_COLORS.NAME && dirLights.some(l => l.getUniformUpdateFlag('ambientColor'))) {
            value = getLightValuesAsFlatArray(dirLights, 'ambientColor');
        }

        if (this.name === U.DIR_LIGHT_DIFFUSE_COLORS.NAME && dirLights.some(l => l.getUniformUpdateFlag('diffuseColor'))) {
            value = getLightValuesAsFlatArray(dirLights, 'diffuseColor');
        }

        if (this.name === U.DIR_LIGHT_SPECULAR_COLORS.NAME && dirLights.some(l => l.getUniformUpdateFlag('specularColor'))) {
            value = getLightValuesAsFlatArray(dirLights, 'specularColor');
        }

        if (this.name === U.DIR_LIGHT_INTENSITIES.NAME && dirLights.some(l => l.getUniformUpdateFlag('intensity'))) {
            value = dirLights.map(l => l.intensity);
        }

        if (this.name === U.DIR_LIGHT_COUNT.NAME && dirLights.length !== this.lastDirLightsCount) {
            value = dirLights.length;
            this.lastDirLightsCount = dirLights.length;
        }

        if (value !== null) {
            if (![U.MODEL_MATRIX.NAME, U.MODEL_VIEW_MATRIX.NAME, U.NORMAL_MATRIX.NAME].includes(this.name)) {
                console.log('uniform update', this.name);
            }
            WebGL2Utils.uniformTypeToUpdateUniformFunction[this.type](this.gl, this.location, value);
        }
    }
};

export default Uniform;
