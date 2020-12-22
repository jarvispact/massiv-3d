import { vec3 } from 'gl-matrix';
import { Component } from '../../../src';

export class Translation implements Component<'Translation', vec3> {
    type: 'Translation';
    data: vec3;

    constructor(x: number, y: number, z: number) {
        this.type = 'Translation';
        this.data = vec3.fromValues(x, y, z);
    }
}