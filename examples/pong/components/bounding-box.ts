import { vec3 } from 'gl-matrix';

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

export type BoundingBoxBufferLayout = typeof boundingBoxBufferLayout;

export const boundingBoxFromBuffer = (buffer: SharedArrayBuffer) => ({
    type: 'BoundingBox' as const,
    buffer,
    data: {
        min: new Float32Array(buffer, boundingBoxBufferLayout.min.offset, minArraySize),
        center: new Float32Array(buffer, boundingBoxBufferLayout.center.offset, centerArraySize),
        max: new Float32Array(buffer, boundingBoxBufferLayout.max.offset, maxArraySize),
    },
});

export type BoundingBox = ReturnType<typeof boundingBoxFromBuffer>;

export type CreateBoundingBoxArgs = {
    min?: vec3;
    center?: vec3;
    max?: vec3;
};

export const createBoundingBox = (args?: CreateBoundingBoxArgs): BoundingBox => {
    const data = new SharedArrayBuffer(totalSize);
    const bb = boundingBoxFromBuffer(data);

    if (args && args.min) {
        vec3.copy(bb.data.min, args.min);
    } else {
        vec3.set(bb.data.min, 0, 0, 0);
    }

    if (args && args.center) {
        vec3.copy(bb.data.center, args.center);
    } else {
        vec3.set(bb.data.center, 0, 0, 0);
    }

    if (args && args.max) {
        vec3.copy(bb.data.max, args.max);
    } else {
        vec3.set(bb.data.max, 0, 0, 0);
    }

    return bb;
};

const tmp = vec3.create();

export const BoundingBox = {
    // TODO: sync with Transform somehow
    translate: (bb: BoundingBox, x: number, y: number, z: number) => {
        tmp[0] = x;
        tmp[1] = y;
        tmp[2] = z;
        vec3.add(bb.data.min, bb.data.min, tmp);
        vec3.add(bb.data.center, bb.data.center, tmp);
        vec3.add(bb.data.max, bb.data.max, tmp);
    },
    // TODO: sync with Transform somehow
    setTranslation: (bb: BoundingBox, x: number, y: number, z: number) => {
        bb.data.center[0] = x;
        bb.data.center[1] = y;
        bb.data.center[2] = z;
    },
};