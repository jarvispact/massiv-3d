import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';
declare type Args = {
    ambientIntensity?: number;
    diffuseColor?: vec3;
    specularColor?: vec3;
    specularShininess?: number;
    opacity?: number;
};
export declare class PhongMaterial implements Material {
    static getShaderSourceCode: () => ShaderSourceCode;
    ambientIntensity: number;
    diffuseColor: vec3;
    specularColor: vec3;
    specularShininess: number;
    opacity: number;
    dirty: {
        ambientIntensity: boolean;
        diffuseColor: boolean;
        specularColor: boolean;
        specularShininess: boolean;
        opacity: boolean;
    };
    constructor(args?: Args);
    getUniformValue(uniformName: string): unknown | null;
    setAmbientIntensity(intensity: number): void;
    setDiffuseColor(r: number, g: number, b: number): void;
    setSpecularColor(r: number, g: number, b: number): void;
    setSpecularShininess(shininess: number): void;
    setOpacity(opacity: number): void;
}
export {};
