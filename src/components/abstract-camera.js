import Vec3 from '../math/vec3';
import Mat4 from '../math/mat4';
import Component from './component';

class AbstractCamera extends Component {
    constructor() {
        super();
        this.upVector = new Vec3(0, 1, 0);
        this.viewMatrix = new Mat4();
        this.projectionMatrix = new Mat4();
    }

    lookAt(position, center) {
        this.viewMatrix.lookAt(position, center, this.upVector);
        return this;
    }
}

export default AbstractCamera;
