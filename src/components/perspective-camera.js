import { vec3, mat4 } from 'gl-matrix';
import Component from './component';
import ComponentTypes from './component-types';

const mat4Identity = () => mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

class PerspectiveCamera extends Component {
    constructor(options = {}) {
        super(ComponentTypes.PERSPECTIVE_CAMERA);
        this.position = options.position ? vec3.fromValues(...options.position) : vec3.fromValues(0, 0, 0);
        this.lookAt = options.lookAt ? vec3.fromValues(...options.lookAt) : vec3.fromValues(0, 0, 0);
        this.upVector = options.upVector ? vec3.fromValues(...options.upVector) : vec3.fromValues(0, 1, 0);
        this.viewMatrix = options.viewMatrix ? mat4.fromValues(...options.viewMatrix) : mat4Identity();
        this.projectionMatrix = options.projectionMatrix ? mat4.fromValues(...options.projectionMatrix) : mat4Identity();
        this.fov = options.fov || 45;
        this.aspect = options.aspect;
        this.near = options.near || 1;
        this.far = options.far || 1000;
        this.dirty = true;

        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.lookAt, this.upVector);
    }

    updateProjectionMatrix() {
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
        this.dirty = true;
    }

    update() {
        if (this.dirty) {
            this.updateViewMatrix();
            this.updateProjectionMatrix();
            this.dirty = false;
            return true;
        }

        return false;
    }
}

export default PerspectiveCamera;
