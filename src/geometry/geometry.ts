export type GeometryData = {
    positions: number[] | null;
    uvs: number[] | null;
    normals: number[] | null;
    indices: number[] | null;
    colors: number[] | null;
};

export interface Geometry {
    getData(): GeometryData;
}