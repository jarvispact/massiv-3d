/* eslint-disable max-len */
import { vec3, quat, mat4 } from 'gl-matrix';

const types = {
    GEOMETRY: 'GEOMETRY',
    DIRECTIONAL_LIGHT: 'DIRECTIONAL_LIGHT',
    STANDARD_MATERIAL: 'STANDARD_MATERIAL',
    TRANSFORM_3D: 'TRANSFORM_3D',
    PERSPECTIVE_CAMERA: 'PERSPECTIVE_CAMERA',
    ORTHOGRAPHIC_CAMERA: 'ORTHOGRAPHIC_CAMERA',
    ORBIT_CAMERA_CONTROL: 'ORBIT_CAMERA_CONTROL',
    EULER_ROTATION: 'EULER_ROTATION',
};

const create = (data) => {
    if (!data || !data.type) throw new Error('a component needs a type property');
    return {
        entityId: null,
        ...data,
    };
};

const createGeometry = (data = {}) => ({
    type: types.GEOMETRY,
    entityId: null,

    vertices: Float32Array.from(data.vertices || []),
    normals: Float32Array.from(data.normals || []),
    uvs: Float32Array.from(data.uvs || []),
    vertexColors: Float32Array.from(data.vertexColors || []),
});

const createDirectionalLight = (data = {}) => ({
    type: types.DIRECTIONAL_LIGHT,
    entityId: null,

    direction: Float32Array.from(data.direction || []),
    ambientColor: data.ambientColor ? vec3.fromValues(...data.ambientColor) : vec3.fromValues(1, 1, 1),
    diffuseColor: data.diffuseColor ? vec3.fromValues(...data.diffuseColor) : vec3.fromValues(1, 1, 1),
    specularColor: data.specularColor ? vec3.fromValues(...data.specularColor) : vec3.fromValues(1, 1, 1),
});

const createStandardMaterial = (data = {}) => ({
    type: types.STANDARD_MATERIAL,
    entityId: null,

    indices: Uint32Array.from(data.indices || []),

    diffuseColor: data.diffuseColor ? vec3.fromValues(...data.diffuseColor) : vec3.fromValues(0.74, 0.38, 0.41),
    specularColor: data.specularColor ? vec3.fromValues(...data.specularColor) : vec3.fromValues(1, 1, 1),
    ambientIntensity: data.ambientIntensity || 0.1,
    specularExponent: data.specularExponent || 0.5,
    specularShininess: data.specularShininess || 256,
    diffuseMap: data.diffuseMap || null,
    specularMap: data.specularMap || null,
});

const createTransform3D = (data = {}) => ({
    type: types.TRANSFORM_3D,
    entityId: null,

    position: data.position ? vec3.fromValues(...data.position) : vec3.fromValues(0, 0, 0),
    quaternion: data.quaternion ? quat.fromValues(...data.quaternion) : quat.fromValues(0, 0, 0, 1),
    scale: data.scale ? vec3.fromValues(...data.scale) : vec3.fromValues(1, 1, 1),
    modelMatrix: data.modelMatrix ? mat4.fromValues(...data.modelMatrix) : mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),

    matrixAutoUpdate: data.matrixAutoUpdate || true,
});

const createPerspectiveCamera = (data = {}) => ({
    type: types.PERSPECTIVE_CAMERA,
    entityId: null,

    position: data.position ? vec3.fromValues(...data.position) : vec3.fromValues(0, 0, 0),
    lookAt: data.lookAt ? vec3.fromValues(...data.lookAt) : vec3.fromValues(0, 0, 0),
    upVector: data.upVector ? vec3.fromValues(...data.upVector) : vec3.fromValues(0, 1, 0),
    viewMatrix: data.viewMatrix ? mat4.fromValues(...data.viewMatrix) : mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    projectionMatrix: data.projectionMatrix ? mat4.fromValues(...data.projectionMatrix) : mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),

    fov: data.fov || 45,
    aspect: data.aspect,
    near: data.near || 1,
    far: data.far || 1000,
});

const createOrthographicCamera = (data = {}) => ({
    type: types.ORTHOGRAPHIC_CAMERA,
    entityId: null,

    position: data.position ? vec3.fromValues(...data.position) : vec3.fromValues(0, 0, 0),
    lookAt: data.lookAt ? vec3.fromValues(...data.lookAt) : vec3.fromValues(0, 0, 0),
    upVector: data.upVector ? vec3.fromValues(...data.upVector) : vec3.fromValues(0, 1, 0),
    viewMatrix: data.viewMatrix ? mat4.fromValues(...data.viewMatrix) : mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    projectionMatrix: data.projectionMatrix ? mat4.fromValues(...data.projectionMatrix) : mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),

    left: data.left,
    right: data.right,
    bottom: data.bottom,
    top: data.top,
    near: data.near,
    far: data.far,
});

const createOrbitCameraControl = (data = {}) => ({
    type: types.ORBIT_CAMERA_CONTROL,
    entityId: null,

    speed: data.speed || 1,
});

const Component = {
    types,
    create,
    createGeometry,
    createDirectionalLight,
    createStandardMaterial,
    createTransform3D,
    createPerspectiveCamera,
    createOrthographicCamera,
    createOrbitCameraControl,
};

export default Component;
