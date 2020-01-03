import Mat4 from '../math/mat4';
import Vec3 from '../math/vec3';
import Quat from '../math/quat';
import Component from './component';

class Transform3D extends Component {
    constructor(position, quaternion, scaling) {
        super();
        this.position = position || new Vec3();
        this.quaternion = quaternion || new Quat();
        this.scaling = scaling || new Vec3(1, 1, 1);
        this.modelMatrix = new Mat4();
        this.transformDirty = position || quaternion || scaling;
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

    computeModelMatrix() {
        if (this.transformDirty) {
            this.modelMatrix.setFromQuaternionTranslationScale(this.quaternion, this.position, this.scaling);
        }

        this.transformDirty = false;
    }
}

export default Transform3D;
