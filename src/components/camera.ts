import { vec3, mat4 } from 'gl-matrix';

export type CameraArgs = {
    position: vec3;
    lookAt?: vec3;
    upVector?: vec3;
};

export type CameraData = {
    position: vec3;
    lookAt: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    dirty: {
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };
};