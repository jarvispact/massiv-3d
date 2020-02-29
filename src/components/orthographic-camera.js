import { mat4 } from 'gl-matrix';
import Camera from './camera';

class OrthographicCamera extends Camera {
    constructor(options = {}) {
        super(options);
        this.left = options.left;
        this.right = options.right;
        this.bottom = options.bottom;
        this.top = options.top;
        this.near = options.near;
        this.far = options.far;
    }

    update() {
        if (this.dirty.viewMatrix) {
            mat4.lookAt(this.viewMatrix, this.position, this.lookAt, this.upVector);
            this.dirty.viewMatrix = false;
        }

        if (this.dirty.projectionMatrix) {
            mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
            this.dirty.projectionMatrix = false;
        }
    }
}

export default OrthographicCamera;
