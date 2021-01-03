import { vec2, vec3 } from 'gl-matrix';
import { Component } from '../../../src';

type PhongMaterialData = {
    ambientIntensity: number;
    diffuseColor: vec3;
    diffuseMap?: HTMLImageElement;
    specularColor: vec3;
    specularMap?: HTMLImageElement;
    specularExponent: number;
    normalMap?: HTMLImageElement;
    opacity: number;
    uvRepeat: vec2;
    dirty: boolean;
};

export class PhongMaterial implements Component<'PhongMaterial', PhongMaterialData> {
    type: 'PhongMaterial';
    data: PhongMaterialData;

    constructor(args: Partial<PhongMaterialData> = {}) {
        this.type = 'PhongMaterial';
        this.data = {
            ambientIntensity: args.ambientIntensity || 0.02,
            diffuseColor: args.diffuseColor || vec3.fromValues(1, 1, 1),
            diffuseMap: args.diffuseMap,
            specularColor: args.specularColor || vec3.fromValues(1, 1, 1),
            specularMap: args.specularMap,
            specularExponent: args.specularExponent || 256,
            normalMap: args.normalMap,
            opacity: args.opacity || 1,
            uvRepeat: args.uvRepeat || vec2.fromValues(1, 1),
            dirty: true,
        };
    }
}