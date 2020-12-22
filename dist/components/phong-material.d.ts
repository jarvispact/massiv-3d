import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
declare type PhongMaterialData = {
    ambientIntensity: number;
    diffuseColor: vec3;
    specularColor: vec3;
    specularExponent: number;
    opacity: number;
};
export declare class PhongMaterial implements Component<'PhongMaterial', PhongMaterialData> {
    type: 'PhongMaterial';
    data: PhongMaterialData;
    private dirty;
    constructor(args?: Partial<PhongMaterialData>);
    setDiffuseColor(r: number, g: number, b: number): void;
    isDirty(): boolean;
    setDirty(dirty: boolean): this;
}
export {};
