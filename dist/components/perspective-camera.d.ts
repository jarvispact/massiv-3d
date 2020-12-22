import { mat4, vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
declare type PerspectiveCameraData = {
    translation: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    fov: number;
    aspect: number;
    near: number;
    far: number;
};
declare type PerspectiveCameraArgs = {
    translation?: vec3;
    upVector?: vec3;
    fov?: number;
    aspect: number;
    near?: number;
    far?: number;
};
export declare class PerspectiveCamera implements Component<'PerspectiveCamera', PerspectiveCameraData> {
    type: 'PerspectiveCamera';
    data: PerspectiveCameraData;
    private dirty;
    constructor(args: PerspectiveCameraArgs);
    setTranslation(x: number, y: number, z: number): this;
    setAspect(aspect: number): this;
    setFov(fov: number): this;
    isDirty(): boolean;
    setDirty(dirty: boolean): this;
}
export {};
