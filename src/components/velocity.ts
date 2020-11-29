import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
import { isSABSupported } from '../utils/is-sab-supported';

type VelocityArgs = {
    translation?: vec3;
    scaling?: vec3;
    rotation?: vec3;
};

type VelocityData = {
    translation: Float32Array;
    scaling: Float32Array;
    rotation: Float32Array;
};

const translationArraySize = 3;
const scalingArraySize = 3;
const rotationArraySize = 3;

const translationSize = translationArraySize * Float32Array.BYTES_PER_ELEMENT;
const scalingSize = scalingArraySize * Float32Array.BYTES_PER_ELEMENT;
const rotationSize = rotationArraySize * Float32Array.BYTES_PER_ELEMENT;
const totalSize = translationSize + scalingSize + rotationSize;

const translationOffset = 0;
const scalingOffset = translationSize;
const rotationOffset = translationSize + scalingSize;

const bufferLayout = {
    translation: { offset: translationOffset, size: translationArraySize },
    scaling: { offset: scalingOffset, size: scalingArraySize },
    rotation: { offset: rotationOffset, size: rotationArraySize },
};

export class Velocity implements Component<'Velocity', VelocityData> {
    type: 'Velocity';
    buffer: BufferConstructor;
    data: VelocityData;

    constructor(args?: VelocityArgs);
    constructor(buffer: BufferConstructor);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
        if (args[0] && typeof args[0].byteLength === 'number') {
            this.type = 'Velocity';
            this.buffer = args[0];
            this.data = {
                translation: new Float32Array(this.buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
                scaling: new Float32Array(this.buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
                rotation: new Float32Array(this.buffer, bufferLayout.rotation.offset, bufferLayout.rotation.size),
            };
        } else {
            this.type = 'Velocity';
            this.buffer = isSABSupported() ? new SharedArrayBuffer(totalSize) : new ArrayBuffer(totalSize);
            this.data = {
                translation: new Float32Array(this.buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
                scaling: new Float32Array(this.buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
                rotation: new Float32Array(this.buffer, bufferLayout.rotation.offset, bufferLayout.rotation.size),
            };

            if (args[0] && args[0].translation) {
                this.setTranslation(args[0].translation[0], args[0].translation[1], args[0].translation[2]);
            } else {
                this.setTranslation(0, 0, 0);
            }

            if (args[0] && args[0].scaling) {
                this.setScale(args[0].scaling[0], args[0].scaling[1], args[0].scaling[2]);
            } else {
                this.setScale(0, 0, 0);
            }

            if (args[0] && args[0].rotation) {
                this.setRotation(args[0].rotation[0], args[0].rotation[1], args[0].rotation[2]);
            } else {
                this.setRotation(0, 0, 0);
            }
        }
    }

    setTranslation(x: number, y: number, z: number) {
        this.data.translation[0] = x;
        this.data.translation[1] = y;
        this.data.translation[2] = z;
        return this;
    }

    setScale(x: number, y: number, z: number) {
        this.data.scaling[0] = x;
        this.data.scaling[1] = y;
        this.data.scaling[2] = z;
        return this;
    }

    setRotation(x: number, y: number, z: number) {
        this.data.rotation[0] = x;
        this.data.rotation[1] = y;
        this.data.rotation[2] = z;
        return this;
    }

    static fromBuffer(buffer: BufferConstructor) {
        return new Velocity(buffer);
    }
}
