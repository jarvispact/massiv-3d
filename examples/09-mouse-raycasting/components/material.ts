import { vec3 } from 'gl-matrix';
import { Component } from '../../../src';

type MaterialData = {
    diffuseColor: vec3;
}

export class Material implements Component<'Material', MaterialData> {
    type: 'Material';
    data: MaterialData;

    constructor(data: MaterialData) {
        this.type = 'Material';
        this.data = data;
    }
}