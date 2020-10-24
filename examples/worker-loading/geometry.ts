import { Component } from '../../src';

export type GeometryData = {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
};

export const Geometry = class extends Component<'Geometry', GeometryData> {
    constructor(data: GeometryData) {
        super('Geometry', data);
    }
}