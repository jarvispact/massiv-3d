import Node from './node';
import Mat4 from '../math/mat4';
import Vec3 from '../math/vec3';
import Quat from '../math/quat';

class Transform3D extends Node {
    constructor({ position, quaternion, scaling } = {}) {
        super();
        this.position = position || new Vec3();
        this.quaternion = quaternion || new Quat();
        this.scaling = scaling || new Vec3(1, 1, 1);
        this.modelMatrix = new Mat4();
        this.transformDirty = false;
    }

    translate(x, y, z) {
        this.position.add(x, y, z);
        this.transformDirty = true;
    }

    scale(x, y, z) {
        this.scaling.multiply(x, y, z);
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quat = Quat.fromEuler(x, y, z);
        this.quaternion.multiply(quat);
        this.transformDirty = true;
    }

    computeModelMatrix(combinedTransformationMatrix) {
        const pos = this.position;
        const scl = this.scaling;
        const rot = this.quaternion;

        if (combinedTransformationMatrix) {
            const transformationMatrix = Mat4.fromQuaternionTranslationScale(rot, pos, scl);
            this.modelMatrix = combinedTransformationMatrix.clone().multiply(transformationMatrix);
        } else if (this.transformDirty) {
            this.modelMatrix.setFromQuaternionTranslationScale(rot, pos, scl);
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].computeModelMatrix(this.modelMatrix);
        }

        this.transformDirty = false;
    }
}

export default Transform3D;
