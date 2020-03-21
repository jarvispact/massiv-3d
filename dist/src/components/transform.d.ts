import { mat4, vec3, quat } from 'gl-matrix';
import { Component } from '../core/component';
export interface TransformData {
    position: vec3;
    quaternion: quat;
    scaling: vec3;
    modelMatrix: mat4;
    eulerRotationCache: quat;
    dirty: boolean;
}
export interface Transform extends Component {
    data: TransformData;
}
export declare const Transform: {
    new (data?: {
        position?: [number, number, number] | Float32Array | undefined;
        quaternion?: Float32Array | [number, number, number, number] | undefined;
        scaling?: [number, number, number] | Float32Array | undefined;
    }): {
        entityId: string;
        type: string;
        data: TransformData;
        translate(translation: vec3): void;
        scale(scaling: vec3): void;
        rotate(eulerRotation: vec3): void;
    };
    readonly TYPE: string;
};
