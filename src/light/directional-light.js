import Transform3D from '../core/transform-3d';
import Vec3 from '../math/vec3';

class DirectionalLight extends Transform3D {
    constructor() {
        super();
        this.direction = new Vec3(0, 0, 0);
        this.color = new Vec3(1, 1, 1);
    }

    getDirection() {
        return this.direction;
    }

    setDirection(x, y, z) {
        this.direction = new Vec3(x, y, z);
        return this;
    }

    getColor() {
        return this.color;
    }

    setColor(r, g, b) {
        this.color = new Vec3(r, g, b);
        return this;
    }
}

export default DirectionalLight;
