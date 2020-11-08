import { vec3 } from 'gl-matrix';

type CreateGeometryArgs = {
    positions: Array<number>;
    indices: Array<number>;
    uvs?: Array<number>;
    normals?: Array<number>;
    colors?: Array<number>;
};

export const getGeometryBufferLayout = (args: CreateGeometryArgs) => {
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
            positions: { offset: positionsOffset, size: positionsSize / Float32Array.BYTES_PER_ELEMENT },
            indices: { offset: indicesOffset, size: indicesSize / Uint32Array.BYTES_PER_ELEMENT },
            uvs: { offset: uvsOffset, size: uvsSize / Float32Array.BYTES_PER_ELEMENT },
            normals: { offset: normalsOffset, size: normalsSize / Float32Array.BYTES_PER_ELEMENT },
            colors: { offset: colorsOffset, size: colorsSize / Float32Array.BYTES_PER_ELEMENT },
        },
    };
};

export type GeometryBufferLayout = ReturnType<typeof getGeometryBufferLayout>;

export const geometryFromBuffer = (buffer: SharedArrayBuffer, bufferLayout: GeometryBufferLayout) => ({
    type: 'Geometry' as const,
    buffer,
    data: {
        positions: new Float32Array(buffer, bufferLayout.layout.positions.offset, bufferLayout.layout.positions.size),
        indices: new Uint32Array(buffer, bufferLayout.layout.indices.offset, bufferLayout.layout.indices.size),
        uvs: new Float32Array(buffer, bufferLayout.layout.uvs.offset, bufferLayout.layout.uvs.size),
        normals: new Float32Array(buffer, bufferLayout.layout.normals.offset, bufferLayout.layout.normals.size),
        colors: new Float32Array(buffer, bufferLayout.layout.colors.offset, bufferLayout.layout.colors.size),
    },
});

export type Geometry = ReturnType<typeof geometryFromBuffer>;

export const createGeometry = (args: CreateGeometryArgs): Geometry => {
    const bufferLayout = getGeometryBufferLayout(args);
    const data = new SharedArrayBuffer(bufferLayout.bufferSize);
    const t = geometryFromBuffer(data, bufferLayout);
    
    t.data.positions.set(args.positions);
    t.data.indices.set(args.indices);
    t.data.uvs.set(args.uvs || []);
    t.data.normals.set(args.normals || []);
    t.data.colors.set(args.colors || []);

    return t;
};

type Args = {
    position?: vec3;
    size?: number;
};

const defaultArgs = {
    position: vec3.fromValues(0, 0, 0),
    size: 1,
};

export const createQuadGeometry = (args?: Args) => {
    const data = { ...defaultArgs, ...args };

    const px = data.position[0];
    const py = data.position[1];
    const pz = data.position[2];
    const hs = data.size / 2;

    return createGeometry({
        positions: [
            -(px + hs), -(py + hs), pz,
            px + hs, -(py + hs), pz,
            px + hs, py + hs, pz,
            -(px + hs), py + hs, pz
        ],
        uvs: [0, 0, 1, 0, 1, 1, 0, 1],
        normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        colors: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
        indices: [0, 1, 2, 0, 2, 3],
    });
};