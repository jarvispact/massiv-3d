import { mat4, quat, vec3 } from 'gl-matrix';
import { Component } from '../core/component';
declare const type = "Transform";
declare type Args = {
    translation?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};
declare type TransformData = {
    translation: vec3;
    scaling: vec3;
    quaternion: quat;
    modelMatrix: mat4;
    cache: {
        translation: vec3;
        scaling: vec3;
        quaternion: quat;
    };
    dirty: {
        modelMatrix: boolean;
    };
    webglDirty: {
        modelMatrix: boolean;
    };
};
export declare class Transform extends Component<typeof type, TransformData> {
    constructor(args?: Args);
    translate(x: number, y: number, z: number): void;
    scale(x: number, y: number, z: number): void;
    rotate(x: number, y: number, z: number): void;
    resetWebglDirtyFlags(): void;
}
export {};
