import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
import { Geometry } from './geometry';
import { Transform } from './transform';
export declare const boundingBoxBufferLayout: {
    initialMin: {
        offset: number;
        size: number;
    };
    initialCenter: {
        offset: number;
        size: number;
    };
    initialMax: {
        offset: number;
        size: number;
    };
    min: {
        offset: number;
        size: number;
    };
    center: {
        offset: number;
        size: number;
    };
    max: {
        offset: number;
        size: number;
    };
};
declare type BoundingBoxArgs = {
    min: vec3;
    center: vec3;
    max: vec3;
};
declare type BoundingBoxData = {
    _initial: {
        min: Float32Array;
        center: Float32Array;
        max: Float32Array;
    };
    min: Float32Array;
    center: Float32Array;
    max: Float32Array;
};
export declare class BoundingBox implements Component<'BoundingBox', BoundingBoxData> {
    type: 'BoundingBox';
    buffer: BufferConstructor;
    data: BoundingBoxData;
    constructor(args: BoundingBoxArgs);
    constructor(buffer: BufferConstructor);
    setFromGeometry(geometry: Geometry, transform?: Transform): void;
    updateFromTransform(transform: Transform): void;
    getLineGeometry(): Geometry;
    static fromGeometry(geometry: Geometry, transform?: Transform): BoundingBox;
    static fromBuffer(buffer: BufferConstructor): BoundingBox;
}
export declare const computeBoundingBox: (geometry: Geometry, transform?: Transform | undefined) => {
    min: [number, number, number];
    center: [number, number, number];
    max: [number, number, number];
};
export declare const getLineGeometryFromBoundingBox: (boundingBox: BoundingBox) => Geometry;
export {};
