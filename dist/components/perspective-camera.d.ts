import { vec3 } from 'gl-matrix';
import { Component } from '../core/component';
import { CameraData, CameraArgs } from './camera';
declare const type = "PerspectiveCamera";
declare type Args = CameraArgs & {
    fov?: number;
    aspect: number;
    near?: number;
    far?: number;
};
export declare type PerspectiveCameraData = CameraData & {
    fov: number;
    aspect: number;
    near: number;
    far: number;
};
export declare class PerspectiveCamera extends Component<typeof type, PerspectiveCameraData> {
    constructor(args: Args);
    translate(translation: vec3): void;
    setAspect(aspect: number): void;
    update(): void;
}
export {};
