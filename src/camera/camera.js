import Transform3D from '../core/transform-3d';
import Vec3 from '../math/vec3';
import Mat4 from '../math/mat4';

// Abstract Class

class Camera extends Transform3D {
    constructor() {
        super();
        this.upVector = new Vec3(0, 1, 0);
        this.viewMatrix = new Mat4();
        this.projectionMatrix = new Mat4();
    }

    lookAt(x, y, z) {
        this.viewMatrix.lookAt(this.position, new Vec3(x, y, z), this.upVector);
    }
}

export default Camera;
