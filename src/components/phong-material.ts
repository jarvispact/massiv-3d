import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';

type PhongMaterialData = {
    ambientIntensity: number;
    diffuseColor: vec3;
    specularColor: vec3;
    specularExponent: number;
    opacity: number;
};

export class PhongMaterial implements Component<'PhongMaterial', PhongMaterialData> {
    type: 'PhongMaterial';
    data: PhongMaterialData;
    private dirty: boolean;

    constructor(args: Partial<PhongMaterialData> = {}) {
        this.type = 'PhongMaterial';
        this.data = {
            ambientIntensity: args.ambientIntensity || 0.01,
            diffuseColor: args.diffuseColor || vec3.fromValues(1, 1, 1),
            specularColor: args.specularColor || vec3.fromValues(1, 1, 1),
            specularExponent: args.specularExponent || 256,
            opacity: args.opacity || 1,
        };

        this.dirty = true;
    }

    setDiffuseColor(r: number, g: number, b: number) {
        this.data.diffuseColor[0] = r;
        this.data.diffuseColor[1] = g;
        this.data.diffuseColor[2] = b;
        this.dirty = true;
    }

    isDirty() {
        return this.dirty;
    }

    setDirty(dirty: boolean) {
        this.dirty = dirty;
        return this;
    }
}