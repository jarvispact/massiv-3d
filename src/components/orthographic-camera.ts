import { CameraArgs, CameraData } from './camera';
import { Component } from '../core/component';
import { vec3, mat4 } from 'gl-matrix';

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
            position: args.position,
            lookAt: args.lookAt ? args.lookAt : vec3.fromValues(0, 0, 0),
            upVector: args.upVector ? args.upVector : vec3.fromValues(0, 1, 0),
            viewMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            projectionMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: {
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

    translate(translation: vec3): void {
        vec3.add(this.data.position, this.data.position, translation);
        this.data.dirty.viewMatrix = true;
    }

    update(): void {
        if (this.data.dirty.viewMatrix) {
            mat4.lookAt(this.data.viewMatrix, this.data.position, this.data.lookAt, this.data.upVector);
            this.data.dirty.viewMatrix = false;
        }
    
        if (this.data.dirty.projectionMatrix) {
            mat4.ortho(this.data.projectionMatrix, this.data.left, this.data.right, this.data.bottom, this.data.top, this.data.near, this.data.far);
            this.data.dirty.projectionMatrix = false;
        }
    }
}
