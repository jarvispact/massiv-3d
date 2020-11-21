import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
import { isSABSupported } from '../utils/is-sab-supported';
import { Geometry } from './geometry';
import { Transform } from './transform';

const minArraySize = 3;
const centerArraySize = 3;
const maxArraySize = 3;

const minSize = minArraySize * Float32Array.BYTES_PER_ELEMENT;
const centerSize = centerArraySize * Float32Array.BYTES_PER_ELEMENT;
const maxSize = maxArraySize * Float32Array.BYTES_PER_ELEMENT;
const totalSize = minSize + centerSize + maxSize;

const minOffset = 0;
const centerOffset = minSize;
const maxOffset = minSize + centerSize;

export const boundingBoxBufferLayout = {
    min: { offset: minOffset, size: minSize },
    center: { offset: centerOffset, size: centerSize },
    max: { offset: maxOffset, size: maxSize },
};

type BoundingBoxArgs = {
    min: vec3;
    center: vec3;
    max: vec3;
};

type BoundingBoxData = {
    min: Float32Array;
    center: Float32Array;
    max: Float32Array;
};

export class BoundingBox implements Component<'BoundingBox', BoundingBoxData> {
    type: 'BoundingBox';
    buffer: BufferConstructor;
    data: BoundingBoxData;

    constructor(args: BoundingBoxArgs);
    constructor(buffer: BufferConstructor);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
        if (args[0] && typeof args[0].byteLength === 'number') {
            this.type = 'BoundingBox';
            this.buffer = args[0];
            this.data = {
                min: new Float32Array(this.buffer, boundingBoxBufferLayout.min.offset, minArraySize),
                center: new Float32Array(this.buffer, boundingBoxBufferLayout.center.offset, centerArraySize),
                max: new Float32Array(this.buffer, boundingBoxBufferLayout.max.offset, maxArraySize),
            };
        } else {
            this.type = 'BoundingBox';
            this.buffer = isSABSupported() ? new SharedArrayBuffer(totalSize) : new ArrayBuffer(totalSize);
            this.data = {
                min: new Float32Array(this.buffer, boundingBoxBufferLayout.min.offset, minArraySize),
                center: new Float32Array(this.buffer, boundingBoxBufferLayout.center.offset, centerArraySize),
                max: new Float32Array(this.buffer, boundingBoxBufferLayout.max.offset, maxArraySize),
            };

            vec3.copy(this.data.min, args[0].min);
            vec3.copy(this.data.center, args[0].center);
            vec3.copy(this.data.max, args[0].max);
        }
    }

    setFromGeometry(geometry: Geometry, transform?: Transform) {
        const args = computeBoundingBox(geometry, transform);
        vec3.copy(this.data.min, args.min);
        vec3.copy(this.data.center, args.center);
        vec3.copy(this.data.max, args.max);
    }

    static fromGeometry(geometry: Geometry, transform?: Transform) {
        return new BoundingBox(computeBoundingBox(geometry, transform));
    }

    static fromBuffer(buffer: BufferConstructor) {
        return new BoundingBox(buffer);
    }
}

export const computeBoundingBox = (geometry: Geometry, transform?: Transform) => {
    const vertices: Array<[number, number, number]> = [];

    for (let p = 0; p < geometry.data.positions.length; p += 3) {
        vertices.push([geometry.data.positions[p], geometry.data.positions[p + 1], geometry.data.positions[p + 2]]);
    }

    const min: [number, number, number] = [0, 0, 0];
    const center: [number, number, number] = [0, 0, 0];
    const max: [number, number, number] = [0, 0, 0];
    
    for (let i = 0; i < geometry.data.indices.length; i++) {
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

    center[0] = (min[0] + max[0]) / 2;
    center[1] = (min[1] + max[1]) / 2;
    center[2] = (min[2] + max[2]) / 2;

    if (transform) {
        vec3.transformMat4(min, min, transform.data.modelMatrix);
        vec3.transformMat4(center, center, transform.data.modelMatrix);
        vec3.transformMat4(max, max, transform.data.modelMatrix);
    }

    return { min, center, max };
};