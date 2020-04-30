import { Geometry, GeometryData } from './geometry';

export class RawGeometry implements Geometry {
    positions: number[] | null;
    uvs: number[] | null;
    normals: number[] | null;
    indices: number[] | null;
    colors: number[] | null;

    constructor(args: Partial<GeometryData> = {}) {
        this.positions = args.positions || null;
        this.uvs = args.uvs || null;
        this.normals = args.normals || null;
        this.indices = args.indices || null;
        this.colors = args.colors || null;
    }

    getGeometryData(): GeometryData {
        return {
            positions: this.positions,
            uvs: this.uvs,
            normals: this.normals,
            indices: this.indices,
            colors: this.colors,
        };
    }
}