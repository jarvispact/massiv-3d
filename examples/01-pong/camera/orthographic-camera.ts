import { mat4 } from 'gl-matrix';
import { AbstractCamera, AbstractCameraArgs } from './abstract-camera';

type OrthographicCameraArgs = AbstractCameraArgs & {
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
};

export class OrthographicCamera extends AbstractCamera {
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;

    constructor(args: OrthographicCameraArgs) {
        super(args);
        this.left = args.left;
        this.right = args.right;
        this.bottom = args.bottom;
        this.top = args.top;
        this.near = args.near;
        this.far = args.far;
        mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }

    setFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
}