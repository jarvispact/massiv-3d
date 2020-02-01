import { vec3, mat4 } from 'gl-matrix';
import Component from './component';
import ComponentTypes from './component-types';

const mat4Identity = () => mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

class OrthographicCamera extends Component {
    constructor(options = {}) {
        super(ComponentTypes.ORTHOGRAPHIC_CAMERA);
        this.position = options.position ? vec3.fromValues(...options.position) : vec3.fromValues(0, 0, 0);
        this.lookAt = options.lookAt ? vec3.fromValues(...options.lookAt) : vec3.fromValues(0, 0, 0);
        this.upVector = options.upVector ? vec3.fromValues(...options.upVector) : vec3.fromValues(0, 1, 0);
        this.viewMatrix = options.viewMatrix ? mat4.fromValues(...options.viewMatrix) : mat4Identity();
        this.projectionMatrix = options.projectionMatrix ? mat4.fromValues(...options.projectionMatrix) : mat4Identity();
        this.left = options.left;
        this.right = options.right;
        this.bottom = options.bottom;
        this.top = options.top;
        this.near = options.near;
        this.far = options.far;
        this.dirty = true;

        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.lookAt, this.upVector);
    }

    updateProjectionMatrix() {
        mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
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

export default OrthographicCamera;
