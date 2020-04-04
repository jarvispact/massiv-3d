import { vec3, quat, mat4 } from 'gl-matrix';
import { Component } from '../core/component';
declare const type = "Transform";
declare type Args = {
    position?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};
declare type TransformData = {
    position: vec3;
    scaling: vec3;
    quaternion: quat;
    rotationCache: quat;
    modelMatrix: mat4;
    dirty: {
        modelMatrix: boolean;
    };
};
export declare class Transform extends Component<typeof type, TransformData> {
    constructor(args?: Args);
    translate(translation: vec3): void;
    scale(scaling: vec3): void;
    rotate(eulerRotation: vec3): void;
    update(): void;
}
export {};
