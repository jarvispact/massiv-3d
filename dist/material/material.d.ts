import { Class } from '../types';
export declare type ShaderSourceCode = {
    vertexShader: string;
    fragmentShader: string;
};
export interface Material {
    getUniformValue(uniformName: string): unknown | null;
}
export declare type MaterialClass = Class<Material> & {
    getShaderSourceCode: () => ShaderSourceCode;
};
