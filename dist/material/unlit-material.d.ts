import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';
declare type Args = {
    color?: vec3;
    opacity?: number;
};
export declare class UnlitMaterial implements Material {
    static getShaderSourceCode: () => ShaderSourceCode;
    color: vec3;
    opacity: number;
    dirty: {
        color: boolean;
        opacity: boolean;
    };
    constructor(args?: Args);
    getUniformValue(uniformName: string): unknown | null;
}
export {};
