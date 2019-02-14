import { createVec3, createMat4, mat4LookAt } from '../utils/math-utils';
import Node from './Node';

// Abstract Class

export default class Camera extends Node {
    constructor() {
        super();
        this.upVector = createVec3(0, 1, 0);
        this.viewMatrix = createMat4();
        this.projectionMatrix = createMat4();
    }

    lookAt(x, y, z) {
        this.viewMatrix = mat4LookAt(this.viewMatrix, this.position, createVec3(x, y, z), this.upVector);
    }
}
