import { Component } from '../../../src';

type GeometryData = {
    positions: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
}

export class Geometry implements Component<'Geometry', GeometryData> {
    type: 'Geometry';
    data: GeometryData;

    constructor(data: GeometryData) {
        this.type = 'Geometry';
        this.data = data;
    }
}