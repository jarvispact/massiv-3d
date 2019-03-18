import MathUtils from './math-utils';
import Light from './light';

export default class DirectionalLight extends Light {
    constructor({ direction, ambientColor, diffuseColor, specularColor } = {}) {
        super({ ambientColor, diffuseColor, specularColor });
        this.direction = direction || MathUtils.createVec3();
    }
}
