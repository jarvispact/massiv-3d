import Component from '../core/component';
import Vec3 from '../math/vec3';

class DirectionalLight extends Component {
    constructor(direction, ambientColor, diffuseColor, specularColor) {
        super();
        this.direction = direction || new Vec3(0, 0, 0);
        this.ambientColor = ambientColor || new Vec3(1, 1, 1);
        this.diffuseColor = diffuseColor || new Vec3(1, 1, 1);
        this.specularColor = specularColor || new Vec3(1, 1, 1);
    }

    getDirection() {
        return this.direction;
    }

    setDirection(x, y, z) {
        this.direction = new Vec3(x, y, z);
        return this;
    }

    getAmbientColor() {
        return this.ambientColor;
    }

    setAmbientColor(r, g, b) {
        this.ambientColor = new Vec3(r, g, b);
        return this;
    }

    getDiffuseColor() {
        return this.diffuseColor;
    }

    setDiffuseColor(r, g, b) {
        this.diffuseColor = new Vec3(r, g, b);
        return this;
    }

    getSpecularColor() {
        return this.specularColor;
    }

    setSpecularColor(r, g, b) {
        this.specularColor = new Vec3(r, g, b);
        return this;
    }
}

export default DirectionalLight;
