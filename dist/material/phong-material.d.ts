import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode, ShaderSourceArgs } from './material';
import { Nullable } from '../types';
declare type Args = {
    ambientIntensity?: number;
    diffuseColor?: vec3;
    diffuseMap?: HTMLImageElement;
    specularColor?: vec3;
    specularMap?: HTMLImageElement;
    specularShininess?: number;
    opacity?: number;
};
export declare class PhongMaterial implements Material {
    ambientIntensity: number;
    diffuseColor: vec3;
    diffuseMap: Nullable<HTMLImageElement>;
    specularColor: vec3;
    specularMap: Nullable<HTMLImageElement>;
    specularShininess: number;
    opacity: number;
    dirty: {
        ambientIntensity: boolean;
        diffuseColor: boolean;
        diffuseMap: boolean;
        specularColor: boolean;
        specularMap: boolean;
        specularShininess: boolean;
        opacity: boolean;
    };
    constructor(args?: Args);
    getUniformValue(uniformName: string): unknown | null;
    getTexture(gl: WebGL2RenderingContext, uniformName: string): WebGLTexture | null;
    getShaderSourceCode({ geometryData }: ShaderSourceArgs): ShaderSourceCode;
    setAmbientIntensity(intensity: number): void;
    setDiffuseColor(r: number, g: number, b: number): void;
    setSpecularColor(r: number, g: number, b: number): void;
    setSpecularShininess(shininess: number): void;
    setOpacity(opacity: number): void;
}
export {};
