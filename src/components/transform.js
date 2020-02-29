import { vec3, quat, mat4 } from 'gl-matrix';
import Component from './component';

const mat4Identity = () => mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

const eulerRotationCache = quat.create();

class Transform extends Component {
    constructor(options = {}) {
        super();
        this.position = options.position ? vec3.fromValues(...options.position) : vec3.fromValues(0, 0, 0);
        this.quaternion = options.quaternion ? quat.fromValues(...options.quaternion) : quat.fromValues(0, 0, 0, 1);
        this.scaling = options.scaling ? vec3.fromValues(...options.scaling) : vec3.fromValues(1, 1, 1);
        this.modelMatrix = options.modelMatrix ? mat4.fromValues(...options.modelMatrix) : mat4Identity();

        this.dirty = {
            modelMatrix: true,
        };

        this.uniformUpdate = {
            modelMatrix: true,
        };
    }

    rotate(x, y, z) {
        quat.fromEuler(eulerRotationCache, x, y, z);
        quat.multiply(this.quaternion, this.quaternion, eulerRotationCache);
        this.dirty.modelMatrix = true;
        this.uniformUpdate.modelMatrix = true;
    }

    update() {
        if (this.dirty.modelMatrix) {
            mat4.fromRotationTranslationScale(this.modelMatrix, this.quaternion, this.position, this.scaling);
            this.dirty.modelMatrix = false;
        }
    }

    getUniformUpdateFlag(name) {
        return this.uniformUpdate[name];
    }

    setUniformUpdateFlag(name, flag) {
        this.uniformUpdate[name] = flag;
    }
}

export default Transform;
