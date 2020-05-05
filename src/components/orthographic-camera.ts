import { mat4, vec3 } from 'gl-matrix';
import { Component } from '../core/component';
import { CameraArgs, CameraData } from './camera';

const type = 'OrthographicCamera';

type Args = CameraArgs & {
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
};

export type OrthographicCameraData = CameraData & {
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
}

export class OrthographicCamera extends Component<typeof type, OrthographicCameraData> {
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
            webglDirty: {
                translation: true,
                viewMatrix: true,
                projectionMatrix: true,
            },
            left: args.left,
            right: args.right,
            bottom: args.bottom,
            top: args.top,
            near: args.near,
            far: args.far,
        });
    }

    translate(x: number, y: number, z: number): void {
        const t = this.data.cache.translation;
        t[0] = x; t[1] = y; t[2] = z;
        vec3.add(this.data.translation, this.data.translation, t);
        this.data.dirty.viewMatrix = true;
        this.data.webglDirty.translation = true;
        this.data.webglDirty.viewMatrix = true;
    }

    resetWebglDirtyFlags(): void {
        this.data.webglDirty.translation = false;
        this.data.webglDirty.viewMatrix = false;
        this.data.webglDirty.projectionMatrix = false;
    }
}
