import MathUtils from './math-utils';
import Camera from './camera';

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
        this.projectionMatrix = MathUtils.mat4Perspective(this.projectionMatrix, fov, aspect, near, far);
    }
}
