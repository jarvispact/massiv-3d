import { vec3, quat, mat4 } from 'gl-matrix';
import { Component } from '../core/component';

const type = 'Transform';

type Args = {
    position?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};

type TransformData = {
    position: vec3;
    scaling: vec3;
    quaternion: quat;
    rotationCache: quat;
    modelMatrix: mat4;
    dirty: {
        modelMatrix: boolean;
    };
};

export class Transform extends Component<typeof type, TransformData> {
    constructor(args: Args = {}) {
        super(type, {
            position: args.position || vec3.fromValues(0, 0, 0),
            scaling: args.scaling || vec3.fromValues(1, 1, 1),
            quaternion: args.quaternion || quat.fromValues(0, 0, 0, 1),
            rotationCache: quat.create(),
            modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: {
                modelMatrix: true,
            }
        });
    }

    translate(translation: vec3): void {
        vec3.add(this.data.position, this.data.position, translation);
        this.data.dirty.modelMatrix = true;
    }

    scale(scaling: vec3): void {
        vec3.add(this.data.scaling, this.data.scaling, scaling);
        this.data.dirty.modelMatrix = true;
    }

    rotate(eulerRotation: vec3): void {
        quat.fromEuler(this.data.rotationCache, eulerRotation[0], eulerRotation[1], eulerRotation[2]);
        quat.multiply(this.data.quaternion, this.data.quaternion, this.data.rotationCache);
        this.data.dirty.modelMatrix = true;
    }

    update(): void {
        if (this.data.dirty.modelMatrix) {
            mat4.fromRotationTranslationScale(this.data.modelMatrix, this.data.quaternion, this.data.position, this.data.scaling);
            this.data.dirty.modelMatrix = false;
        }
    }
}