import { Component } from '../../../src';

type RotationData = {
    degrees: number;
}

export class Rotation implements Component<'Rotation', RotationData> {
    type: 'Rotation';
    data: RotationData;

    constructor(data: RotationData) {
        this.type = 'Rotation';
        this.data = data;
    }
}