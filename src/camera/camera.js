import Vec3 from '../math/vec3';
import Mat4 from '../math/mat4';
import Component from '../core/component';

// Abstract Class

class Camera extends Component {
    constructor() {
        super();
        this.upVector = new Vec3(0, 1, 0);
        this.viewMatrix = new Mat4();
        this.projectionMatrix = new Mat4();
    }

    lookAt(position, center) {
        this.viewMatrix.lookAt(position, center, this.upVector);
    }
}

export default Camera;
