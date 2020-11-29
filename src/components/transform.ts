import { mat4, quat, vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
import { isSABSupported } from '../utils/is-sab-supported';

type TransformArgs = {
    translation?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};

type TransformData = {
    translation: Float32Array;
    scaling: Float32Array;
    quaternion: Float32Array;
    modelMatrix: Float32Array;
    dirty: Float32Array;
};

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

const bufferLayout = {
    translation: { offset: translationOffset, size: translationArraySize },
    scaling: { offset: scalingOffset, size: scalingArraySize },
    quaternion: { offset: quaternionOffset, size: quaternionArraySize },
    modelMatrix: { offset: modelMatrixOffset, size: modelMatrixArraySize },
    dirty: { offset: dirtyOffset, size: dirtyArraySize },
};

const tmp = {
    vec3: vec3.create(),
    quat: quat.create(),
};

export class Transform implements Component<'Transform', TransformData> {
    type: 'Transform';
    buffer: BufferConstructor;
    data: TransformData;

    constructor(args?: TransformArgs);
    constructor(buffer: BufferConstructor);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
        if (args[0] && typeof args[0].byteLength === 'number') {
            this.type = 'Transform';
            this.buffer = args[0];
            this.data = {
                translation: new Float32Array(this.buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
                scaling: new Float32Array(this.buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
                quaternion: new Float32Array(this.buffer, bufferLayout.quaternion.offset, bufferLayout.quaternion.size),
                modelMatrix: new Float32Array(this.buffer, bufferLayout.modelMatrix.offset, bufferLayout.modelMatrix.size),
                dirty: new Float32Array(this.buffer, bufferLayout.dirty.offset, bufferLayout.dirty.size),
            };
        } else {
            this.type = 'Transform';
            this.buffer = isSABSupported() ? new SharedArrayBuffer(totalSize) : new ArrayBuffer(totalSize);
            this.data = {
                translation: new Float32Array(this.buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
                scaling: new Float32Array(this.buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
                quaternion: new Float32Array(this.buffer, bufferLayout.quaternion.offset, bufferLayout.quaternion.size),
                modelMatrix: new Float32Array(this.buffer, bufferLayout.modelMatrix.offset, bufferLayout.modelMatrix.size),
                dirty: new Float32Array(this.buffer, bufferLayout.dirty.offset, bufferLayout.dirty.size),
            };

            if (args[0] && args[0].translation) {
                this.setTranslation(args[0].translation[0], args[0].translation[1], args[0].translation[2]);
            } else {
                this.setTranslation(0, 0, 0);
            }

            if (args[0] && args[0].scaling) {
                this.setScale(args[0].scaling[0], args[0].scaling[1], args[0].scaling[2]);
            } else {
                this.setScale(1, 1, 1);
            }

            if (args[0] && args[0].quaternion) {
                this.setQuaternion(args[0].quaternion[0], args[0].quaternion[1], args[0].quaternion[2], args[0].quaternion[3]);
            } else {
                this.setQuaternion(0, 0, 0, 1);
            }

            this.setDirty().update();
        }
    }

    isDirty() {
        return this.data.dirty[0] === 1;
    }

    setDirty(dirty = true) {
        this.data.dirty[0] = Number(dirty);
        return this;
    }

    update() {
        if (this.isDirty()) {
            mat4.fromRotationTranslationScale(this.data.modelMatrix, this.data.quaternion, this.data.translation, this.data.scaling);
        }
        return this;
    }

    setTranslation(x: number, y: number, z: number) {
        this.data.translation[0] = x;
        this.data.translation[1] = y;
        this.data.translation[2] = z;
        this.setDirty();
        return this;
    }

    setTranslationX(x: number) {
        this.data.translation[0] = x;
        this.setDirty();
        return this;
    }

    setTranslationY(y: number) {
        this.data.translation[1] = y;
        this.setDirty();
        return this;
    }

    setTranslationZ(z: number) {
        this.data.translation[2] = z;
        this.setDirty();
        return this;
    }

    setScale(x: number, y: number, z: number) {
        this.data.scaling[0] = x;
        this.data.scaling[1] = y;
        this.data.scaling[2] = z;
        this.setDirty();
        return this;
    }

    setScaleX(x: number) {
        this.data.scaling[0] = x;
        this.setDirty();
        return this;
    }

    setScaleY(y: number) {
        this.data.scaling[1] = y;
        this.setDirty();
        return this;
    }

    setScaleZ(z: number) {
        this.data.scaling[2] = z;
        this.setDirty();
        return this;
    }

    setQuaternion(x: number, y: number, z: number, w: number) {
        this.data.quaternion[0] = x;
        this.data.quaternion[1] = y;
        this.data.quaternion[2] = z;
        this.data.quaternion[3] = w;
        this.setDirty();
        return this;
    }

    setQuaternionX(x: number) {
        this.data.quaternion[0] = x;
        this.setDirty();
        return this;
    }

    setQuaternionY(y: number) {
        this.data.quaternion[1] = y;
        this.setDirty();
        return this;
    }

    setQuaternionZ(z: number) {
        this.data.quaternion[2] = z;
        this.setDirty();
        return this;
    }

    setQuaternionW(w: number) {
        this.data.quaternion[3] = w;
        this.setDirty();
        return this;
    }

    translate(x: number, y: number, z: number) {
        tmp.vec3[0] = x;
        tmp.vec3[1] = y;
        tmp.vec3[2] = z;
        vec3.add(this.data.translation, this.data.translation, tmp.vec3);
        this.setDirty();
        return this;
    }

    scale(x: number, y: number, z: number) {
        tmp.vec3[0] = x;
        tmp.vec3[1] = y;
        tmp.vec3[2] = z;
        vec3.add(this.data.scaling, this.data.scaling, tmp.vec3);
        this.setDirty();
        return this;
    }

    rotate(x: number, y: number, z: number) {
        quat.fromEuler(tmp.quat, x, y, z);
        quat.multiply(this.data.quaternion, this.data.quaternion, tmp.quat);
        this.setDirty();
        return this;
    }

    static fromBuffer(buffer: BufferConstructor) {
        return new Transform(buffer);
    }
}
