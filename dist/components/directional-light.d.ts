import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
declare type DirectionalLightData = {
    direction: vec3;
    diffuseColor: vec3;
    specularColor: vec3;
};
export declare class DirectionalLight implements Component<'DirectionalLight', DirectionalLightData> {
    type: 'DirectionalLight';
    data: DirectionalLightData;
    private dirty;
    constructor(args?: Partial<DirectionalLightData>);
    setDiffuseColor(r: number, g: number, b: number): void;
    isDirty(): boolean;
    setDirty(dirty: boolean): this;
}
export {};
