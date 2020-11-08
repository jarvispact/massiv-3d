import { mat4 } from 'gl-matrix';
import { AbstractCamera, AbstractCameraArgs } from './abstract-camera';

export type PerspectiveCameraArgs = AbstractCameraArgs & {
    aspect: number;
    fov?: number;
    near?: number;
    far?: number;
};

export class PerspectiveCamera extends AbstractCamera {
    aspect: number;
    fov: number;
    near: number;
    far: number;

    constructor(args: PerspectiveCameraArgs) {
        super(args);
        this.aspect = args.aspect;
        this.fov = args.fov || 45;
        this.near = args.near || 0.1;
        this.far = args.far || 1000;
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
    }

    setAspect(aspect: number) {
        this.aspect = aspect;
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
        return this;
    }
}