import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
import { isSABSupported } from '../utils/is-sab-supported';
import { Geometry } from './geometry';
import { Transform } from './transform';

const initialMinArraySize = 3;
const initialCenterArraySize = 3;
const initialMaxArraySize = 3;
const minArraySize = 3;
const centerArraySize = 3;
const maxArraySize = 3;

const initialMinSize = initialMinArraySize * Float32Array.BYTES_PER_ELEMENT;
const initialCenterSize = initialCenterArraySize * Float32Array.BYTES_PER_ELEMENT;
const initialMaxSize = initialMaxArraySize * Float32Array.BYTES_PER_ELEMENT;
const minSize = minArraySize * Float32Array.BYTES_PER_ELEMENT;
const centerSize = centerArraySize * Float32Array.BYTES_PER_ELEMENT;
const maxSize = maxArraySize * Float32Array.BYTES_PER_ELEMENT;
const totalSize = initialMinSize + initialCenterSize + initialMaxSize + minSize + centerSize + maxSize;

const initialMinOffset = 0;
const initialCenterOffset = initialMinSize;
const initialMaxOffset = initialMinSize + initialCenterSize;
const minOffset = initialMinSize + initialCenterSize + initialMaxSize;
const centerOffset = initialMinSize + initialCenterSize + initialMaxSize + minSize;
const maxOffset = initialMinSize + initialCenterSize + initialMaxSize + minSize + centerSize;

export const boundingBoxBufferLayout = {
    initialMin: { offset: initialMinOffset, size: initialMinArraySize },
    initialCenter: { offset: initialCenterOffset, size: initialCenterArraySize },
    initialMax: { offset: initialMaxOffset, size: initialMaxArraySize },
    min: { offset: minOffset, size: minArraySize },
    center: { offset: centerOffset, size: centerArraySize },
    max: { offset: maxOffset, size: maxArraySize },
};

type BoundingBoxArgs = {
    min: vec3;
    center: vec3;
    max: vec3;
};

type BoundingBoxData = {
    _initial: {
        min: Float32Array;
        center: Float32Array;
        max: Float32Array;
    };
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
                _initial: {
                    min: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMin.offset, boundingBoxBufferLayout.initialMin.size),
                    center: new Float32Array(this.buffer, boundingBoxBufferLayout.initialCenter.offset, boundingBoxBufferLayout.initialCenter.size),
                    max: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMax.offset, boundingBoxBufferLayout.initialMax.size),
                },
                min: new Float32Array(this.buffer, boundingBoxBufferLayout.min.offset, boundingBoxBufferLayout.min.size),
                center: new Float32Array(this.buffer, boundingBoxBufferLayout.center.offset, boundingBoxBufferLayout.center.size),
                max: new Float32Array(this.buffer, boundingBoxBufferLayout.max.offset, boundingBoxBufferLayout.max.size),
            };
        } else {
            this.type = 'BoundingBox';
            this.buffer = isSABSupported() ? new SharedArrayBuffer(totalSize) : new ArrayBuffer(totalSize);
            this.data = {
                _initial: {
                    min: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMin.offset, boundingBoxBufferLayout.initialMin.size),
                    center: new Float32Array(this.buffer, boundingBoxBufferLayout.initialCenter.offset, boundingBoxBufferLayout.initialCenter.size),
                    max: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMax.offset, boundingBoxBufferLayout.initialMax.size),
                },
                min: new Float32Array(this.buffer, boundingBoxBufferLayout.min.offset, boundingBoxBufferLayout.min.size),
                center: new Float32Array(this.buffer, boundingBoxBufferLayout.center.offset, boundingBoxBufferLayout.center.size),
                max: new Float32Array(this.buffer, boundingBoxBufferLayout.max.offset, boundingBoxBufferLayout.max.size),
            };

            vec3.copy(this.data._initial.min, args[0].min);
            vec3.copy(this.data._initial.center, args[0].center);
            vec3.copy(this.data._initial.max, args[0].max);

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

    updateFromTransform(transform: Transform) {
        vec3.copy(this.data.min, this.data._initial.min);
        vec3.copy(this.data.center, this.data._initial.center);
        vec3.copy(this.data.max, this.data._initial.max);
        vec3.transformMat4(this.data.min, this.data.min, transform.data.modelMatrix);
        vec3.transformMat4(this.data.center, this.data.center, transform.data.modelMatrix);
        vec3.transformMat4(this.data.max, this.data.max, transform.data.modelMatrix);
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