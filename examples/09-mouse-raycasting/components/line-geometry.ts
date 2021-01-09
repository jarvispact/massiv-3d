import { Component } from '../../../src';

type LineGeometryData = {
    positions: Array<number>;
}

export class LineGeometry implements Component<'LineGeometry', LineGeometryData> {
    type: 'LineGeometry';
    data: LineGeometryData;

    constructor(data: LineGeometryData) {
        this.type = 'LineGeometry';
        this.data = data;
    }
}