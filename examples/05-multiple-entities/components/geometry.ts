import { Component } from '../../../src';

type GeometryData = {
    positions: Array<number>;
    indices: Array<number>;
    uvs: Array<number>;
}

export class Geometry implements Component<'Geometry', GeometryData> {
    type: 'Geometry';
    data: GeometryData;

    constructor(data: GeometryData) {
        this.type = 'Geometry';
        this.data = data;
    }
}