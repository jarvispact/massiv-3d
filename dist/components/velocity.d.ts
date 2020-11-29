import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';
import { BufferConstructor } from '../types';
declare type VelocityArgs = {
    translation?: vec3;
    scaling?: vec3;
    rotation?: vec3;
};
declare type VelocityData = {
    translation: Float32Array;
    scaling: Float32Array;
    rotation: Float32Array;
};
export declare class Velocity implements Component<'Velocity', VelocityData> {
    type: 'Velocity';
    buffer: BufferConstructor;
    data: VelocityData;
    constructor(args?: VelocityArgs);
    constructor(buffer: BufferConstructor);
    setTranslation(x: number, y: number, z: number): this;
    setScale(x: number, y: number, z: number): this;
    setRotation(x: number, y: number, z: number): this;
    static fromBuffer(buffer: BufferConstructor): Velocity;
}
export {};
