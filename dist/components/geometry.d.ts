import { Component } from '../core/component';
declare const type = "Geometry";
declare type GeometryData = {
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
    colors: number[];
};
export declare class Geometry extends Component<typeof type, GeometryData> {
    constructor(args: Partial<GeometryData>);
}
export {};
