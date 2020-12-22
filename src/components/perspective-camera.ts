import { mat4, vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';

type PerspectiveCameraData = {
    translation: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    fov: number;
    aspect: number;
    near: number;
    far: number;
};

type PerspectiveCameraArgs = {
    translation?: vec3;
    upVector?: vec3;
    fov?: number;
    aspect: number;
    near?: number;
    far?: number;
};

export class PerspectiveCamera implements Component<'PerspectiveCamera', PerspectiveCameraData> {
    type: 'PerspectiveCamera';
    data: PerspectiveCameraData;
    private dirty: boolean;

    constructor(args: PerspectiveCameraArgs) {
        this.type = 'PerspectiveCamera';
        this.data = {
            translation: args.translation || vec3.fromValues(0, 0, 0),
            upVector: args.upVector || vec3.fromValues(0, 1, 0),
            viewMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            projectionMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            fov: args.fov || 45,
            aspect: args.aspect,
            near: args.near || 0.01,
            far: args.far || 1000,
        };

        mat4.lookAt(this.data.viewMatrix, this.data.translation, [0, 0, 0], this.data.upVector);
        mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
        this.dirty = true;
    }

    setTranslation(x: number, y: number, z: number) {
        this.data.translation[0] = x;
        this.data.translation[1] = y;
        this.data.translation[2] = z;
        mat4.lookAt(this.data.viewMatrix, this.data.translation, [0, 0, 0], this.data.upVector);
        this.dirty = true;
        return this;
    }

    setAspect(aspect: number) {
        this.data.aspect = aspect;
        mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
        this.dirty = true;
        return this;
    }

    setFov(fov: number) {
        this.data.fov = fov;
        mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
        this.dirty = true;
        return this;
    }

    isDirty() {
        return this.dirty;
    }

    setDirty(dirty: boolean) {
        this.dirty = dirty;
        return this;
    }
}