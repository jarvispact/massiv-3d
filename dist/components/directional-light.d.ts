import { Component } from '../core/component';
import { vec3 } from 'gl-matrix';
declare const type = "DirectionalLight";
declare type Args = {
    direction: vec3;
    color?: vec3;
    intensity?: number;
};
declare type DirectionalLightData = {
    direction: vec3;
    color: vec3;
    intensity: number;
    webglDirty: {
        direction: boolean;
        color: boolean;
        intensity: boolean;
    };
};
export declare class DirectionalLight extends Component<typeof type, DirectionalLightData> {
    constructor(args: Args);
    setDirection(x: number, y: number, z: number): void;
    setColor(r: number, g: number, b: number): void;
    setIntensity(intensity: number): void;
    resetWebglDirtyFlags(): void;
}
export {};
