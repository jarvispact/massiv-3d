import MathUtils from './math-utils';
import Node3D from './node-3d';

// Abstract Class

export default class Camera extends Node3D {
    constructor() {
        super();
        this.upVector = MathUtils.createVec3(0, 1, 0);
        this.viewMatrix = MathUtils.createMat4();
        this.projectionMatrix = MathUtils.createMat4();
    }

    lookAt(x, y, z) {
        this.viewMatrix = MathUtils.mat4LookAt(this.viewMatrix, this.position, MathUtils.createVec3(x, y, z), this.upVector);
    }
}
