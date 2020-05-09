import { mat4 } from 'gl-matrix';
import Camera from './camera';

class PerspectiveCamera extends Camera {
    constructor(options = {}) {
        super(options);
        this.fov = options.fov || 45;
        this.aspect = options.aspect;
        this.near = options.near || 1;
        this.far = options.far || 1000;
    }

    setAspect(aspect) {
        this.aspect = aspect;
        this.dirty.projectionMatrix = true;
        this.uniformUpdate.projectionMatrix = true;
    }

    update() {
        if (this.dirty.viewMatrix) {
            mat4.lookAt(this.viewMatrix, this.position, this.lookAt, this.upVector);
            this.dirty.viewMatrix = false;
        }

        if (this.dirty.projectionMatrix) {
            mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
            this.dirty.projectionMatrix = false;
        }
    }
}

export default PerspectiveCamera;
