import { vec3 } from 'gl-matrix';
import { Component } from '../../../src';

export class Color implements Component<'Color', vec3> {
    type: 'Color';
    data: vec3;

    constructor(x: number, y: number, z: number) {
        this.type = 'Color';
        this.data = vec3.fromValues(x, y, z);
    }
}