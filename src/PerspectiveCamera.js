import { mat4Perspective } from './math-utils';
import Camera from './Camera';

export default class PerspectiveCamera extends Camera {
    constructor(fov, aspect, near, far) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix(fov, aspect, near, far);
    }

    updateProjectionMatrix(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projectionMatrix = mat4Perspective(this.projectionMatrix, fov, aspect, near, far);
    }
}
