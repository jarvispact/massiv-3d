import { CameraArgs, CameraData } from './camera';
import { Component } from '../core/component';
import { vec3 } from 'gl-matrix';
declare const type = "OrthographicCamera";
declare type Args = CameraArgs & {
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
};
export declare type OrthographicCameraData = CameraData & {
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
};
export declare class OrthographicCamera extends Component<typeof type, OrthographicCameraData> {
    constructor(args: Args);
    translate(translation: vec3): void;
    update(): void;
}
export {};
