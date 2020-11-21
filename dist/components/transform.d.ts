import { quat, vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
declare type TransformArgs = {
    translation?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};
declare type TransformData = {
    translation: Float32Array;
    scaling: Float32Array;
    quaternion: Float32Array;
    modelMatrix: Float32Array;
    dirty: Float32Array;
};
export declare class Transform implements Component<'Transform', TransformData> {
    type: 'Transform';
    buffer: BufferConstructor;
    data: TransformData;
    constructor(args?: TransformArgs, buffer?: BufferConstructor);
    isDirty(): boolean;
    setDirty(dirty?: boolean): this;
    update(): this;
    setTranslation(x: number, y: number, z: number): this;
    setTranslationX(x: number): this;
    setTranslationY(y: number): this;
    setTranslationZ(z: number): this;
    setScale(x: number, y: number, z: number): this;
    setScaleX(x: number): this;
    setScaleY(y: number): this;
    setScaleZ(z: number): this;
    setQuaternion(x: number, y: number, z: number, w: number): this;
    setQuaternionX(x: number): this;
    setQuaternionY(y: number): this;
    setQuaternionZ(z: number): this;
    setQuaternionW(w: number): this;
    translate(x: number, y: number, z: number): this;
    scale(x: number, y: number, z: number): this;
    rotate(x: number, y: number, z: number): this;
    static fromBuffer(buffer: BufferConstructor): Transform;
}
export {};
