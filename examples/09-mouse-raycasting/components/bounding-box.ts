import { mat4, vec3 } from 'gl-matrix';
import { Component } from '../../../src';
import { Geometry } from './geometry';

type BoundingBoxData = {
    initialMin: vec3;
    initialMax: vec3;
    min: vec3;
    max: vec3;
};

type BoundingBoxArgs = {
    min: vec3;
    max: vec3;
};

export class BoundingBox implements Component<'BoundingBox', BoundingBoxData> {
    type: 'BoundingBox';
    data: BoundingBoxData;

    constructor(args: BoundingBoxArgs) {
        this.type = 'BoundingBox';
        this.data = {
            initialMin: vec3.create(),
            initialMax: vec3.create(),
            min: vec3.create(),
            max: vec3.create(),
        };

        vec3.copy(this.data.initialMin, args.min);
        vec3.copy(this.data.initialMax, args.max);
        vec3.copy(this.data.min, args.min);
        vec3.copy(this.data.max, args.max);
    }

    getLineGeometryPositions() {
        const { min, max } = this.data;

        return new Float32Array([
            // line 1
            min[0], min[1], max[2], // -x -y +z
            max[0], min[1], max[2], // +x -y +z
            // line 2
            min[0], max[1], max[2], // -x +y +z
            max[0], max[1], max[2], // +x +y +z
            // line 3
            min[0], min[1], min[2], // -x -y -z
            max[0], min[1], min[2], // +x -y -z
            // line 4
            min[0], max[1], min[2], // -x +y -z
            max[0], max[1], min[2], // +x +y -z
            // line 5
            max[0], min[1], max[2], // +x -y +z
            max[0], min[1], min[2], // +x -y -z
            // line 6
            max[0], max[1], max[2], // +x +y +z
            max[0], max[1], min[2], // +x +y -z
            // line 5
            min[0], min[1], max[2], // -x -y +z
            min[0], min[1], min[2], // -x -y -z
            // line 6
            min[0], max[1], max[2], // -x +y +z
            min[0], max[1], min[2], // -x +y -z
            // line 7
            min[0], min[1], max[2], // -x -y +z
            min[0], max[1], max[2], // -x +y +z
            // line 8
            max[0], min[1], max[2], // +x -y +z
            max[0], max[1], max[2], // +x +y +z
            // line 9
            min[0], min[1], min[2], // -x -y -z
            min[0], max[1], min[2], // -x +y -z
            // line 10
            max[0], min[1], min[2], // +x -y -z
            max[0], max[1], min[2], // +x +y -z
        ]);
    }

    updateFromGeometry(geometry: Geometry) {
        const aabb = computeBoundingBox(geometry);
        this.data.min = aabb.min;
        this.data.max = aabb.max;
    }

    static fromGeometry(geometry: Geometry) {
        return new BoundingBox(computeBoundingBox(geometry));
    }
}

export const computeBoundingBox = (geometry: Geometry) => {
    const vertices: Array<[number, number, number]> = [];

    for (let p = 0; p < geometry.data.positions.length; p += 3) {
        vertices.push([geometry.data.positions[p], geometry.data.positions[p + 1], geometry.data.positions[p + 2]]);
    }

    const min: [number, number, number] = [0, 0, 0];
    const max: [number, number, number] = [0, 0, 0];

    // the following separation for index 0 and the rest is done
    // in the case that the geometry is translated, scaled or rotated.

    // initialize from first index 0
    const idx = geometry.data.indices[0];
    const x = vertices[idx][0];
    const y = vertices[idx][1];
    const z = vertices[idx][2];

    min[0] = x;
    min[1] = y;
    min[2] = z;

    max[0] = x;
    max[1] = y;
    max[2] = z;

    // starting at 1
    for (let i = 1; i < geometry.data.indices.length - 1; i++) {
        const idx = geometry.data.indices[i];
        const x = vertices[idx][0];
        const y = vertices[idx][1];
        const z = vertices[idx][2];

        if (x <= min[0]) min[0] = x;
        if (y <= min[1]) min[1] = y;
        if (z <= min[2]) min[2] = z;

        if (x >= max[0]) max[0] = x;
        if (y >= max[1]) max[1] = y;
        if (z >= max[2]) max[2] = z;
    }

    // in case of a plane min and max have the same value on 1 axis
    // this creates issues with the ray - aabb intersection algorithm

    if (min[0] === max[0]) {
        min[0] -= 0.0001;
        max[0] += 0.0001;
    }

    if (min[1] === max[1]) {
        min[1] -= 0.0001;
        max[1] += 0.0001;
    }

    if (min[2] === max[2]) {
        min[2] -= 0.0001;
        max[2] += 0.0001;
    }

    return { min, max };
};

export const getBoundingBoxCenter = (out: vec3, min: vec3, max: vec3) => {
    out[0] = (min[0] + max[0]) / 2;
    out[1] = (min[1] + max[1]) / 2;
    out[2] = (min[2] + max[2]) / 2;
    return out;
};