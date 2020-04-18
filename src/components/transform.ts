import { vec3, quat, mat4 } from 'gl-matrix';
import { Component } from '../core/component';

const type = 'Transform';

type Args = {
    translation?: vec3;
    scaling?: vec3;
    quaternion?: quat;
};

type TransformData = {
    translation: vec3;
    scaling: vec3;
    quaternion: quat;
    modelMatrix: mat4;
    cache: {
        translation: vec3;
        scaling: vec3;
        quaternion: quat;
    };
    dirty: {
        modelMatrix: boolean;
    };
};

export class Transform extends Component<typeof type, TransformData> {
    constructor(args: Args = {}) {
        super(type, {
            translation: args.translation || vec3.fromValues(0, 0, 0),
            scaling: args.scaling || vec3.fromValues(1, 1, 1),
            quaternion: args.quaternion || quat.fromValues(0, 0, 0, 1),
            modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            cache: {
                translation: vec3.create(),
                scaling: vec3.create(),
                quaternion: quat.create(),
            },
            dirty: {
                modelMatrix: true,
            }
        });
    }

    translate(x: number, y: number, z: number): void {
        const t = this.data.cache.translation;
        t[0] = x; t[1] = y; t[2] = z;
        vec3.add(this.data.translation, this.data.translation, t);
        this.data.dirty.modelMatrix = true;
    }

    scale(x: number, y: number, z: number): void {
        const s = this.data.cache.scaling;
        s[0] = x; s[1] = y; s[2] = z;
        vec3.add(this.data.scaling, this.data.scaling, s);
        this.data.dirty.modelMatrix = true;
    }

    rotate(x: number, y: number, z: number): void {
        const q = this.data.cache.quaternion;
        quat.fromEuler(q, x, y, z);
        quat.multiply(this.data.quaternion, this.data.quaternion, q);
        this.data.dirty.modelMatrix = true;
    }
}