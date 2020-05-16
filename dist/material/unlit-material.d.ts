import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';
declare type Args = {
    color?: vec3;
    opacity?: number;
};
export declare class UnlitMaterial implements Material {
    color: vec3;
    opacity: number;
    dirty: {
        color: boolean;
        opacity: boolean;
    };
    constructor(args?: Args);
    getUniformValue(uniformName: string): unknown | null;
    getTexture(): WebGLTexture | null;
    getShaderSourceCode(): ShaderSourceCode;
    setColor(r: number, g: number, b: number): void;
    setOpacity(opacity: number): void;
}
export {};
