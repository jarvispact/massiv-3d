import { vec3 } from 'gl-matrix';
import { Component } from '../../../src';

export class Rotation implements Component<'Rotation', vec3> {
    type: 'Rotation';
    data: vec3;

    constructor(data: vec3) {
        this.type = 'Rotation';
        this.data = data;
    }
}