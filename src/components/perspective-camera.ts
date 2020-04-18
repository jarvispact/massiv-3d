import { vec3, mat4 } from 'gl-matrix';
import { Component } from '../core/component';
import { CameraData, CameraArgs } from './camera';

const type = 'PerspectiveCamera';

type Args = CameraArgs & {
    fov?: number;
    aspect: number;
    near?: number;
    far?: number;
};

export type PerspectiveCameraData = CameraData & {
    fov: number;
    aspect: number;
    near: number;
    far: number;
}

export class PerspectiveCamera extends Component<typeof type, PerspectiveCameraData> {
    constructor(args: Args) {
        super(type, {
            translation: args.translation,
            lookAt: args.lookAt ? args.lookAt : vec3.fromValues(0, 0, 0),
            upVector: args.upVector ? args.upVector : vec3.fromValues(0, 1, 0),
            viewMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            projectionMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            cache: {
                translation: vec3.create(),
            },
            dirty: {
                viewMatrix: true,
                projectionMatrix: true,
            },
            fov: args.fov || 45,
            aspect: args.aspect,
            near: args.near || 0.1,
            far: args.far || 1000,
        });
    }

    translate(x: number, y: number, z: number): void {
        const t = this.data.cache.translation;
        t[0] = x; t[1] = y; t[2] = z;
        vec3.add(this.data.translation, this.data.translation, t);
        this.data.dirty.viewMatrix = true;
    }

    setAspect(aspect: number): void {
        this.data.aspect = aspect;
        this.data.dirty.projectionMatrix = true;
    }
}
