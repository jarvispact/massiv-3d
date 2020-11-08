import { mat4, vec3 } from 'gl-matrix';

export type AbstractCameraArgs = {
    translation: vec3;
    lookAt?: vec3;
    upVector?: vec3;
    viewMatrix?: mat4;
    projectionMatrix?: mat4;
};

export abstract class AbstractCamera {
    translation: vec3;
    lookAtVector: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;

    constructor(args: AbstractCameraArgs) {
        this.translation = args.translation;
        this.lookAtVector = args.lookAt || vec3.fromValues(0, 0, 0);
        this.upVector = args.upVector || vec3.fromValues(0, 1, 0);
        this.viewMatrix = args.viewMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        this.projectionMatrix = args.projectionMatrix || mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        mat4.lookAt(this.viewMatrix, this.translation, this.lookAtVector, this.upVector);
    }

    setTranslation(x: number, y: number, z: number) {
        this.translation[0] = x;
        this.translation[1] = y;
        this.translation[2] = z;
        mat4.lookAt(this.viewMatrix, this.translation, this.lookAtVector, this.upVector);
        return this;
    }

    lookAt(x: number, y: number, z: number) {
        this.lookAtVector[0] = x;
        this.lookAtVector[1] = y;
        this.lookAtVector[2] = z;
        mat4.lookAt(this.viewMatrix, this.translation, this.lookAtVector, this.upVector);
        return this;
    }

    setUpVector(x: number, y: number, z: number) {
        this.upVector[0] = x;
        this.upVector[1] = y;
        this.upVector[2] = z;
        mat4.lookAt(this.viewMatrix, this.translation, this.lookAtVector, this.upVector);
        return this;
    }
}