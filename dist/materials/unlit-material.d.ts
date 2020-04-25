import { Material } from '../core/material';
import { vec3 } from 'gl-matrix';
declare type Args = {
    color?: vec3;
    opacity?: number;
};
export declare class UnlitMaterial extends Material {
    color: vec3;
    opacity: number;
    constructor(args?: Args);
    setColor(r: number, g: number, b: number): void;
}
export {};
