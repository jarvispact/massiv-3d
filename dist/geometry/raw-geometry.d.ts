import { Geometry, GeometryData } from './geometry';
export declare class RawGeometry implements Geometry {
    positions: number[] | null;
    uvs: number[] | null;
    normals: number[] | null;
    indices: number[] | null;
    colors: number[] | null;
    constructor(args?: Partial<GeometryData>);
    getData(): GeometryData;
}
