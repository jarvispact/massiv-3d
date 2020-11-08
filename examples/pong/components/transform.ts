import { mat4, quat, vec3 } from 'gl-matrix';

const translationArraySize = 3;
const scalingArraySize = 3;
const quaternionArraySize = 4;
const modelMatrixArraySize = 16;
const dirtyArraySize = 1;

const translationSize = translationArraySize * Float32Array.BYTES_PER_ELEMENT;
const scalingSize = scalingArraySize * Float32Array.BYTES_PER_ELEMENT;
const quaternionSize = quaternionArraySize * Float32Array.BYTES_PER_ELEMENT;
const modelMatrixSize = modelMatrixArraySize * Float32Array.BYTES_PER_ELEMENT;
const dirtySize = dirtyArraySize * Float32Array.BYTES_PER_ELEMENT;
const totalSize = translationSize + scalingSize + quaternionSize + modelMatrixSize + dirtySize;

const translationOffset = 0;
const scalingOffset = translationSize;
const quaternionOffset = translationSize + scalingSize;
const modelMatrixOffset = translationSize + scalingSize + quaternionSize;
const dirtyOffset = translationSize + scalingSize + quaternionSize + modelMatrixSize;

export const transformBufferLayout = {
    translation: { offset: translationOffset, size: translationSize },
    scaling: { offset: scalingOffset, size: scalingSize },
    quaternion: { offset: quaternionOffset, size: quaternionSize },
    modelMatrix: { offset: modelMatrixOffset, size: modelMatrixSize },
    dirty: { offset: dirtyOffset, size: dirtySize },
};

export type TransformBufferLayout = typeof transformBufferLayout;

type CreateTransformArgs = {
    translation?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};

export const transformFromBuffer = (buffer: SharedArrayBuffer) => ({
    type: 'Transform' as const,
    buffer,
    data: {
        translation: new Float32Array(buffer, transformBufferLayout.translation.offset, translationArraySize),
        scaling: new Float32Array(buffer, transformBufferLayout.scaling.offset, scalingArraySize),
        quaternion: new Float32Array(buffer, transformBufferLayout.quaternion.offset, quaternionArraySize),
        modelMatrix: new Float32Array(buffer, transformBufferLayout.modelMatrix.offset, modelMatrixArraySize),
        dirty: new Float32Array(buffer, transformBufferLayout.dirty.offset, dirtyArraySize),
    },
});

export type Transform = ReturnType<typeof transformFromBuffer>;

export const createTransform = (args?: CreateTransformArgs): Transform => {
    const data = new SharedArrayBuffer(totalSize);
    const t = transformFromBuffer(data);

    if (args && args.translation) {
        vec3.copy(t.data.translation, args.translation);
    } else {
        vec3.set(t.data.translation, 0, 0, 0);
    }

    if (args && args.scaling) {
        vec3.copy(t.data.scaling, args.scaling);
    } else {
        vec3.set(t.data.scaling, 1, 1, 1);
    }

    if (args && args.quaternion) {
        quat.copy(t.data.quaternion, args.quaternion);
    } else {
        quat.set(t.data.quaternion, 0, 0, 0, 1);
    }

    mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.translation, t.data.scaling);
    t.data.dirty[0] = 1;

    return t;
};

const tmp = vec3.create();

export const Transform = {
    translate: (t: Transform, x: number, y: number, z: number) => {
        tmp[0] = x;
        tmp[1] = y;
        tmp[2] = z;
        vec3.add(t.data.translation, t.data.translation, tmp);
        mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.translation, t.data.scaling);
        t.data.dirty[0] = 1;
    },
    setTranslation: (t: Transform, x: number, y: number, z: number) => {
        t.data.translation[0] = x;
        t.data.translation[1] = y;
        t.data.translation[2] = z;
        mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.translation, t.data.scaling);
        t.data.dirty[0] = 1;
    },
    setScaling: (t: Transform, x: number, y: number, z: number) => {
        t.data.scaling[0] = x;
        t.data.scaling[1] = y;
        t.data.scaling[2] = z;
        mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.translation, t.data.scaling);
        t.data.dirty[0] = 1;
    },
    isDirty: (t: Transform) => t.data.dirty[0] === 1,
    setDirty: (t: Transform, dirty: boolean) => {
        t.data.dirty[0] = Number(dirty);
    },
};