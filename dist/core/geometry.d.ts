declare type GeometryData = {
    positions?: number[];
    uvs?: number[];
    normals?: number[];
    indices?: number[];
    colors?: number[];
};
export declare class Geometry {
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
    colors: number[];
    constructor(args?: GeometryData);
}
export {};
