import Node from './node';
import Mat3 from '../math/mat3';
import Vec2 from '../math/vec2';

class Transform2D extends Node {
    constructor() {
        super();
        this.position = new Vec2();
        this.rotation = 0;
        this.scaling = new Vec2();
        this.modelMatrix = new Mat3();
        this.transformDirty = false;
    }

    translate(x, y) {
        this.position.add(x, y);
        this.transformDirty = true;
    }

    scale(x, y) {
        this.scaling.add(x, y);
        this.transformDirty = true;
    }

    rotate(angle) {
        this.rotation += angle;
        this.transformDirty = true;
    }
}

export default Transform2D;
