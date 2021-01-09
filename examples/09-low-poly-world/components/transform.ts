import { mat4, quat, vec3 } from 'gl-matrix';
import { Component } from '../../../src';

type TransformData = {
    translation: vec3;
    scaling: vec3;
    modelMatrix: mat4;
    dirty: boolean;
}

type TransformArgs = {
    translation?: vec3;
    scaling?: vec3;
};

export class Transform implements Component<'Transform', TransformData> {
    type: 'Transform';
    data: TransformData;

    constructor(args: TransformArgs = {}) {
        this.type = 'Transform';
        this.data = {
            translation: args.translation || vec3.fromValues(0, 0, 0),
            scaling: args.scaling || vec3.fromValues(1, 1, 1),
            modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: true,
        };

        mat4.fromRotationTranslationScale(this.data.modelMatrix, quat.fromValues(0, 0, 0, 1), this.data.translation, this.data.scaling);
    }

    rotateX(radians: number) {
        mat4.rotateX(this.data.modelMatrix, this.data.modelMatrix, radians);
        this.data.dirty = true;
    }

    rotateY(radians: number) {
        mat4.rotateY(this.data.modelMatrix, this.data.modelMatrix, radians);
        this.data.dirty = true;
    }

    rotateZ(radians: number) {
        mat4.rotateZ(this.data.modelMatrix, this.data.modelMatrix, radians);
        this.data.dirty = true;
    }
}