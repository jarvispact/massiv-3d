import { vec3 } from 'gl-matrix';
import { Component } from '../../../src';

export class Rotation implements Component<'Rotation', vec3> {
    type: 'Rotation';
    data: vec3;

    constructor(x: number, y: number, z: number) {
        this.type = 'Rotation';
        this.data = vec3.fromValues(x, y, z);
    }
}