import { mat4, vec3, quat } from 'gl-matrix';
import { Component } from '../core/component';

export interface TransformData {
    position: vec3;
    quaternion: quat;
    scaling: vec3;
    modelMatrix: mat4;
    eulerRotationCache: quat;
    dirty: boolean;
}

export interface Transform extends Component {
    data: TransformData;
}

const TransformType = 'Transform';

export const Transform = class implements Transform {
    entityId!: string;
    type = TransformType;
    data: TransformData;

    constructor(data: {position?: vec3; quaternion?: quat; scaling?: vec3} = {}) {
        this.data = {
            position: data.position ? data.position : [0, 0, 0],
            quaternion: data.quaternion ? data.quaternion : [0, 0, 0, 1],
            scaling: data.scaling ? data.scaling : [1, 1, 1],
            modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            eulerRotationCache: quat.fromValues(0, 0, 0, 1),
            dirty: true,
        };
    }

    static get TYPE(): string {
        return TransformType;
    }

    translate(translation: vec3): void {
        vec3.add(this.data.position, this.data.position, translation);
        this.data.dirty = true;
    }

    scale(scaling: vec3): void {
        vec3.add(this.data.scaling, this.data.scaling, scaling);
        this.data.dirty = true;
    }

    rotate(eulerRotation: vec3): void {
        quat.fromEuler(this.data.eulerRotationCache, eulerRotation[0], eulerRotation[1], eulerRotation[2]);
        quat.multiply(this.data.quaternion, this.data.quaternion, this.data.eulerRotationCache);
        this.data.dirty = true;
    }
};
