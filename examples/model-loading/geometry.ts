import { Component } from '../../src';

export type GeometryData = {
    positions: number[];
    normals: number[];
    indices: number[];
};

export const Geometry = class extends Component<'Geometry', GeometryData> {
    constructor(data: GeometryData) {
        super('Geometry', data);
    }
}