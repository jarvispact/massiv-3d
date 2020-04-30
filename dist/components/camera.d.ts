import { mat4, vec3 } from 'gl-matrix';
export declare type CameraArgs = {
    translation: vec3;
    lookAt?: vec3;
    upVector?: vec3;
};
export declare type CameraData = {
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
    webgl2UniformUpdateFlag: {
        translation: boolean;
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };
};
