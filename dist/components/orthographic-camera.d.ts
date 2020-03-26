import { vec3, mat4 } from 'gl-matrix';
import { Component } from '../core/component';
interface Arguments {
    position: vec3;
    lookAt?: vec3;
    upVector?: vec3;
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
}
export interface OrthographicCameraData {
    position: vec3;
    lookAt: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    dirty: {
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
}
export interface OrthographicCamera extends Component {
    data: OrthographicCameraData;
    translate(translation: vec3): void;
}
export declare const OrthographicCamera: {
    new (data: Arguments): {
        entityId: string;
        type: string;
        data: OrthographicCameraData;
        translate(translation: vec3): void;
        translate(translation: vec3): void;
    };
    readonly TYPE: string;
};
export {};
