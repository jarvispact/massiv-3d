import { Component } from '../core/component';

const type = 'Geometry';

type GeometryData = {
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
    colors: number[];
};

export class Geometry extends Component<typeof type, GeometryData> {
    constructor(args: Partial<GeometryData>) {
        super(type, {
            positions: args.positions || [],
            uvs: args.uvs || [],
            normals: args.normals || [],
            indices: args.indices || [],
            colors: args.colors || [],
        });
    }
}