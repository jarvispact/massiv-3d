import { mat4Ortho } from '../utils/math-utils';
import Camera from './camera';

export default class OrthographicCamera extends Camera {
    constructor(left, right, bottom, top, near, far) {
        super();
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix(left, right, bottom, top, near, far);
    }

    updateProjectionMatrix(left, right, bottom, top, near, far) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.projectionMatrix = mat4Ortho(this.projectionMatrix, left, right, bottom, top, near, far);
    }
}
