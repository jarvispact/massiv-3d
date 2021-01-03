import { vec3 } from 'gl-matrix';
import { Component } from '../../../src';

type DirectionalLightData = {
    direction: vec3;
    diffuseColor: vec3;
    specularColor: vec3;
    dirty: boolean;
};

type DirectionalLightArgs = {
    direction: vec3;
    diffuseColor?: vec3;
    specularColor?: vec3;
};

export class DirectionalLight implements Component<'DirectionalLight', DirectionalLightData> {
    type: 'DirectionalLight';
    data: DirectionalLightData;

    constructor(args: DirectionalLightArgs) {
        this.type = 'DirectionalLight';
        this.data = {
            direction: args.direction,
            diffuseColor: args.diffuseColor || vec3.fromValues(1, 1, 1),
            specularColor: args.specularColor || vec3.fromValues(1, 1, 1),
            dirty: true,
        };
    }
}