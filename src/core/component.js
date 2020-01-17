import { vec3, quat, mat4 } from 'gl-matrix';

export const COMPONENT_TYPES = {
    GEOMETRY: 'GEOMETRY',
    DIRECTIONAL_LIGHT: 'DIRECTIONAL_LIGHT',
    STANDARD_MATERIAL: 'STANDARD_MATERIAL',
    TRANSFORM_3D: 'TRANSFORM_3D',
    PERSPECTIVE_CAMERA: 'PERSPECTIVE_CAMERA',
    ORTHOGRAPHIC_CAMERA: 'ORTHOGRAPHIC_CAMERA',
};

export const createGeometryComponent = (data = {}) => ({
    type: COMPONENT_TYPES.GEOMETRY,
    entityId: null,

    vertices: data.vertices || [],
    normals: data.normals || [],
    uvs: data.uvs || [],
    vertexColors: data.vertexColors || [],
});

export const createDirectionalLightComponent = (data = {}) => ({
    type: COMPONENT_TYPES.DIRECTIONAL_LIGHT,
    entityId: null,

    direction: data.direction || [],
    ambientColor: data.ambientColor || vec3.fromValues(1, 1, 1),
    diffuseColor: data.diffuseColor || vec3.fromValues(1, 1, 1),
    specularColor: data.specularColor || vec3.fromValues(1, 1, 1),
});

export const createStandardMaterialComponent = (data = {}) => ({
    type: COMPONENT_TYPES.STANDARD_MATERIAL,
    entityId: null,

    indices: data.indices || [],

    diffuseColor: data.diffuseColor || vec3.fromValues(0.74, 0.38, 0.41),
    specularColor: data.specularColor || vec3.fromValues(1, 1, 1),
    ambientIntensity: data.ambientIntensity || 0.1,
    specularExponent: data.specularExponent || 0.5,
    specularShininess: data.specularShininess || 256,
    diffuseMap: data.diffuseMap || null,
    specularMap: data.specularMap || null,
});

export const createTransform3DComponent = (data = {}) => ({
    type: COMPONENT_TYPES.TRANSFORM_3D,
    entityId: null,

    position: data.position || vec3.fromValues(0, 0, 0),
    quaternion: data.quaternion || quat.fromValues(0, 0, 0, 1),
    scale: data.scale || vec3.fromValues(1, 1, 1),
    modelMatrix: data.modelMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
});

export const createPerspectiveCameraComponent = (data = {}) => ({
    type: COMPONENT_TYPES.PERSPECTIVE_CAMERA,
    entityId: null,

    upVector: data.upVector || vec3.fromValues(0, 1, 0),
    viewMatrix: data.viewMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    projectionMatrix: data.projectionMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),

    fov: data.fov || 45,
    aspect: data.aspect,
    near: data.near || 1,
    far: data.far || 1000,
});

export const createOrthographicCameraComponent = (data = {}) => ({
    type: COMPONENT_TYPES.ORTHOGRAPHIC_CAMERA,
    entityId: null,

    upVector: data.upVector || vec3.fromValues(0, 1, 0),
    viewMatrix: data.viewMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    projectionMatrix: data.projectionMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),

    left: data.left,
    right: data.right,
    bottom: data.bottom,
    top: data.top,
    near: data.near,
    far: data.far,
});
