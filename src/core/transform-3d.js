import Node from './node';
import Mat4 from '../math/mat4';
import Vec3 from '../math/vec3';
import Quat from '../math/quat';

class Transform3D extends Node {
    constructor() {
        super();
        this.position = new Vec3();
        this.quaternion = new Quat();
        this.scaling = new Vec3(1, 1, 1);
        this.modelMatrix = new Mat4();
        this.transformDirty = false;
    }

    translate(x, y, z) {
        this.position.add(x, y, z);
        this.transformDirty = true;
    }

    scale(x, y, z) {
        this.scaling.add(x, y, z);
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quat = new Quat().setFromEuler(x, y, z);        
        this.quaternion.multiply(quat);
        this.transformDirty = true;
    }

    computeModelMatrix() {
        if (this.transformDirty) {
            this.modelMatrix.setFromQuaternionTranslationScale(this.quaternion, this.position, this.scaling);
            this.transformDirty = false;
        }

        return this.modelMatrix;
    }
}

export default Transform3D;
