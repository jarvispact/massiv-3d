import { vec3, mat4 } from 'gl-matrix';

export type CameraArgs = {
    translation: vec3;
    lookAt?: vec3;
    upVector?: vec3;
};

export type CameraData = {
    translation: vec3;
    lookAt: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    cache: {
        translation: vec3;
    };
    dirty: {
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };
};