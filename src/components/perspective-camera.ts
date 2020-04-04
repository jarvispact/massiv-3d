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
            position: args.position,
            lookAt: args.lookAt ? args.lookAt : vec3.fromValues(0, 0, 0),
            upVector: args.upVector ? args.upVector : vec3.fromValues(0, 1, 0),
            viewMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            projectionMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
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

    translate(translation: vec3): void {
        vec3.add(this.data.position, this.data.position, translation);
        this.data.dirty.viewMatrix = true;
    }

    setAspect(aspect: number): void {
        this.data.aspect = aspect;
        this.data.dirty.projectionMatrix = true;
    }

    update(): void {
        if (this.data.dirty.viewMatrix) {
            mat4.lookAt(this.data.viewMatrix, this.data.position, this.data.lookAt, this.data.upVector);
            this.data.dirty.viewMatrix = false;
        }
    
        if (this.data.dirty.projectionMatrix) {
            mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
            this.data.dirty.projectionMatrix = false;
        }
    }
}
