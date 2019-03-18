import MathUtils from './math-utils';
import Node3D from './node-3d';

// Abstract Class

export default class Light extends Node3D {
    constructor({ ambientColor, diffuseColor, specularColor } = {}) {
        super();
        this.ambientColor = ambientColor || MathUtils.createVec3();
        this.diffuseColor = diffuseColor || MathUtils.createVec3();
        this.specularColor = specularColor || MathUtils.createVec3();
    }
}
