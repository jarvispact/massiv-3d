import { vec3, mat4 } from 'gl-matrix';
import Component from './component';

const mat4Identity = () => mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

const Camera = class extends Component {
    constructor(options) {
        super();
        this.position = options.position ? vec3.fromValues(...options.position) : vec3.fromValues(0, 0, 0);
        this.lookAt = options.lookAt ? vec3.fromValues(...options.lookAt) : vec3.fromValues(0, 0, 0);
        this.upVector = options.upVector ? vec3.fromValues(...options.upVector) : vec3.fromValues(0, 1, 0);

        this.viewMatrix = mat4Identity();
        this.projectionMatrix = mat4Identity();

        this.dirty = {
            viewMatrix: true,
            projectionMatrix: true,
        };

        this.uniformUpdate = {
            position: true,
            viewMatrix: true,
            projectionMatrix: true,
        };
    }

    setPosition(position) {
        this.position[0] = position[0];
        this.position[1] = position[1];
        this.position[2] = position[2];
        this.dirty.viewMatrix = true;
        this.uniformUpdate.position = true;
        this.uniformUpdate.viewMatrix = true;
    }

    getUniformUpdateFlags() {
        return this.uniformUpdate;
    }

    getUniformUpdateFlag(name) {
        return this.uniformUpdate[name];
    }

    setUniformUpdateFlag(name, flag) {
        this.uniformUpdate[name] = flag;
    }
};

export default Camera;
