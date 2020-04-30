import { Component } from '../core/component';
import { CameraArgs, CameraData } from './camera';
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
    translate(x: number, y: number, z: number): void;
    setAspect(aspect: number): void;
}
export {};
