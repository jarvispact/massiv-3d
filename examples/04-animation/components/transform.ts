import { mat4, vec3 } from 'gl-matrix';
import { Component } from '../../../src';

type TransformData = {
    translation: vec3;
    modelMatrix: mat4;
    dirty: boolean;
}

type TransformArgs = {
    translation?: vec3;
};

export class Transform implements Component<'Transform', TransformData> {
    type: 'Transform';
    data: TransformData;

    constructor(args: TransformArgs = {}) {
        this.type = 'Transform';
        this.data = {
            translation: args.translation || vec3.fromValues(0, 0, 0),
            modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: true,
        };

        mat4.translate(this.data.modelMatrix, this.data.modelMatrix, this.data.translation);
    }

    rotateY(radians: number) {
        mat4.rotateY(this.data.modelMatrix, this.data.modelMatrix, radians);
        this.data.dirty = true;
    }
}