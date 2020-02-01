import { vec3, quat, mat4, mat3 } from 'gl-matrix';
import Component from './component';
import ComponentTypes from './component-types';

const mat4Identity = () => mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
const mat3Identity = () => mat3.fromValues(1, 0, 0, 0, 1, 0, 0, 0, 1);

class Transform3D extends Component {
    constructor(options = {}) {
        super(ComponentTypes.TRANSFORM_3D);
        this.position = options.position ? vec3.fromValues(...options.position) : vec3.fromValues(0, 0, 0);
        this.quaternion = options.quaternion ? quat.fromValues(...options.quaternion) : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale ? vec3.fromValues(...options.scale) : vec3.fromValues(1, 1, 1);
        this.modelMatrix = options.modelMatrix ? mat4.fromValues(...options.modelMatrix) : mat4Identity();
        this.modelViewMatrix = options.modelMatrix ? mat4.fromValues(...options.modelMatrix) : mat4Identity();
        this.normalMatrix = options.modelMatrix ? mat3.fromValues(...options.modelMatrix) : mat3Identity();
        this.matrixAutoUpdate = options.matrixAutoUpdate !== undefined ? options.matrixAutoUpdate : true;
        this.dirty = options.position || options.quaternion || options.scale;
    }

    rotate(x, y, z) {
        quat.fromEuler(this.quaternion, x, y, z);
        this.dirty = true;
    }

    update(camera) {
        const needsUpdate = (this.matrixAutoUpdate && this.dirty) || camera.dirty;
        if (needsUpdate) {
            mat4.fromRotationTranslationScale(this.modelMatrix, this.quaternion, this.position, this.scale);
            mat4.multiply(this.modelViewMatrix, camera.viewMatrix, this.modelMatrix);
            mat3.normalFromMat4(this.normalMatrix, this.modelViewMatrix);
            this.dirty = false;
            return true;
        }

        return false;
    }
}

export default Transform3D;
