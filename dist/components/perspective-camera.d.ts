import { vec3, mat4 } from 'gl-matrix';
import { Component } from '../core/component';
interface Arguments {
    position: vec3;
    lookAt?: vec3;
    upVector?: vec3;
    fov?: number;
    aspect: number;
    near?: number;
    far?: number;
}
export interface PerspectiveCameraData {
    position: vec3;
    lookAt: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    dirty: {
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };
    fov: number;
    aspect: number;
    near: number;
    far: number;
}
export interface PerspectiveCamera extends Component {
    data: PerspectiveCameraData;
    translate(translation: vec3): void;
}
export declare const PerspectiveCamera: {
    new (data: Arguments): {
        entityId: string;
        type: string;
        data: PerspectiveCameraData;
        translate(translation: vec3): void;
        translate(translation: vec3): void;
        setAspect(aspect: number): void;
    };
    readonly TYPE: string;
};
export {};
