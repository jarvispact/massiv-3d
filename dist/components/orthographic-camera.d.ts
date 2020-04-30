import { Component } from '../core/component';
import { CameraArgs, CameraData } from './camera';
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
    translate(x: number, y: number, z: number): void;
}
export {};
