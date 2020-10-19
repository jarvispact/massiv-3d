import { mat4, quat, vec3 } from 'gl-matrix';
import { Component } from '../../src';

type TransformData = {
    translation: vec3;
    scaling: vec3;
    quaternion: quat;
    modelMatrix: mat4;
};

export const Transform = class extends Component<'Transform', TransformData> {
    constructor(data: Partial<TransformData> = {}) {
        super('Transform', {
            translation: data.translation || [0, 0, 0],
            scaling: data.scaling || [1, 1, 1],
            quaternion: data.quaternion || [0, 0, 0, 1],
            modelMatrix: mat4.create(),
        });

        mat4.fromRotationTranslationScale(this.data.modelMatrix, this.data.quaternion, this.data.translation, this.data.scaling);
    }
}