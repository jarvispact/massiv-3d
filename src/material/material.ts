import { Class } from '../types';

export type ShaderSourceCode = {
    vertexShader: string;
    fragmentShader: string;
};

export interface Material {
    getUniformValue(uniformName: string): unknown | null;
}

export type MaterialClass = Class<Material> & {
    getShaderSourceCode: () => ShaderSourceCode;
};