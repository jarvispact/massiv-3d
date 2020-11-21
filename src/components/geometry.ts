import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
import { isSABSupported } from '../utils/is-sab-supported';

type GeometryArgs = {
    positions: Array<number> | Float32Array;
    indices: Array<number> | Uint32Array;
    uvs?: Array<number> | Float32Array;
    normals?: Array<number> | Float32Array;
    colors?: Array<number> | Float32Array;
};

type GeometryData = {
    positions: Float32Array;
    indices: Uint32Array;
    uvs: Float32Array;
    normals: Float32Array;
    colors: Float32Array;
};

export const getGeometryBufferLayout = (args: GeometryArgs) => {
    const positionsSize = args.positions.length * Float32Array.BYTES_PER_ELEMENT;
    const indicesSize = args.indices.length * Uint32Array.BYTES_PER_ELEMENT;
    const uvsSize = args.uvs ? args.uvs.length * Float32Array.BYTES_PER_ELEMENT : 0;
    const normalsSize = args.normals ? args.normals.length * Float32Array.BYTES_PER_ELEMENT : 0;
    const colorsSize = args.colors ? args.colors.length * Float32Array.BYTES_PER_ELEMENT : 0;

    const positionsOffset = 0;
    const indicesOffset = positionsSize;
    const uvsOffset = positionsSize + indicesSize;
    const normalsOffset = positionsSize + indicesSize + uvsSize;
    const colorsOffset = positionsSize + indicesSize + uvsSize + normalsSize;

    const bufferSize = positionsSize + indicesSize + uvsSize + normalsSize + colorsSize;

    return {
        bufferSize,
        layout: {
            positions: { offset: positionsOffset, size: args.positions.length },
            indices: { offset: indicesOffset, size: args.indices.length },
            uvs: { offset: uvsOffset, size: args.uvs ? args.uvs.length : 0 },
            normals: { offset: normalsOffset, size: args.normals ? args.normals.length : 0 },
            colors: { offset: colorsOffset, size: args.colors ? args.colors.length : 0 },
        },
    };
};

export type GeometryBufferLayout = ReturnType<typeof getGeometryBufferLayout>;

export class Geometry implements Component<'Geometry', GeometryData> {
    type: 'Geometry';
    bufferLayout: GeometryBufferLayout;
    buffer: BufferConstructor;
    data: GeometryData;

    constructor(args: GeometryArgs);
    constructor(bufferLayout: GeometryBufferLayout, buffer: BufferConstructor);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
        if (args.length === 1) {
            this.type = 'Geometry';
            this.bufferLayout = getGeometryBufferLayout(args[0]);
            this.buffer = isSABSupported() ? new SharedArrayBuffer(this.bufferLayout.bufferSize) : new ArrayBuffer(this.bufferLayout.bufferSize);
            this.data = {
                positions: new Float32Array(this.buffer, this.bufferLayout.layout.positions.offset, this.bufferLayout.layout.positions.size),
                indices: new Uint32Array(this.buffer, this.bufferLayout.layout.indices.offset, this.bufferLayout.layout.indices.size),
                uvs: new Float32Array(this.buffer, this.bufferLayout.layout.uvs.offset, this.bufferLayout.layout.uvs.size),
                normals: new Float32Array(this.buffer, this.bufferLayout.layout.normals.offset, this.bufferLayout.layout.normals.size),
                colors: new Float32Array(this.buffer, this.bufferLayout.layout.colors.offset, this.bufferLayout.layout.colors.size),
            };

            this.data.positions.set(args[0].positions);
            this.data.indices.set(args[0].indices);
            this.data.uvs.set(args[0].uvs || []);
            this.data.normals.set(args[0].normals || []);
            this.data.colors.set(args[0].colors || []);
        } else if (args.length === 2) {
            this.type = 'Geometry';
            this.bufferLayout = args[0];
            this.buffer = args[1];
            this.data = {
                positions: new Float32Array(this.buffer, this.bufferLayout.layout.positions.offset, this.bufferLayout.layout.positions.size),
                indices: new Uint32Array(this.buffer, this.bufferLayout.layout.indices.offset, this.bufferLayout.layout.indices.size),
                uvs: new Float32Array(this.buffer, this.bufferLayout.layout.uvs.offset, this.bufferLayout.layout.uvs.size),
                normals: new Float32Array(this.buffer, this.bufferLayout.layout.normals.offset, this.bufferLayout.layout.normals.size),
                colors: new Float32Array(this.buffer, this.bufferLayout.layout.colors.offset, this.bufferLayout.layout.colors.size),
            };
        } else {
            throw new Error('invalid argument length');
        }
    }

    static fromBuffer(bufferLayout: GeometryBufferLayout, buffer: BufferConstructor) {
        return new Geometry(bufferLayout, buffer);
    }
}
