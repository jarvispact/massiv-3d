import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
declare type GeometryArgs = {
    positions: Array<number> | Float32Array;
    indices: Array<number> | Uint32Array;
    uvs?: Array<number> | Float32Array;
    normals?: Array<number> | Float32Array;
    colors?: Array<number> | Float32Array;
};
declare type GeometryData = {
    positions: Float32Array;
    indices: Uint32Array;
    uvs: Float32Array;
    normals: Float32Array;
    colors: Float32Array;
};
export declare const getGeometryBufferLayout: (args: GeometryArgs) => {
    bufferSize: number;
    layout: {
        positions: {
            offset: number;
            size: number;
        };
        indices: {
            offset: number;
            size: number;
        };
        uvs: {
            offset: number;
            size: number;
        };
        normals: {
            offset: number;
            size: number;
        };
        colors: {
            offset: number;
            size: number;
        };
    };
};
export declare type GeometryBufferLayout = ReturnType<typeof getGeometryBufferLayout>;
export declare class Geometry implements Component<'Geometry', GeometryData> {
    type: 'Geometry';
    bufferLayout: GeometryBufferLayout;
    buffer: BufferConstructor;
    data: GeometryData;
    constructor(args: GeometryArgs);
    constructor(bufferLayout: GeometryBufferLayout, buffer: BufferConstructor);
    static fromBuffer(bufferLayout: GeometryBufferLayout, buffer: BufferConstructor): Geometry;
}
export {};
