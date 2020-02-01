import { vec3 } from 'gl-matrix';
import Component from './component';
import ComponentTypes from './component-types';

class DirectionalLight extends Component {
    constructor(options = {}) {
        super(ComponentTypes.DIRECTIONAL_LIGHT);
        this.direction = options.direction ? vec3.fromValues(...options.direction) : vec3.fromValues(5, 5, 5);
        this.ambientColor = options.ambientColor ? vec3.fromValues(...options.ambientColor) : vec3.fromValues(1, 1, 1);
        this.diffuseColor = options.diffuseColor ? vec3.fromValues(...options.diffuseColor) : vec3.fromValues(1, 1, 1);
        this.specularColor = options.specularColor ? vec3.fromValues(...options.specularColor) : vec3.fromValues(1, 1, 1);
        this.dirty = true;
    }

    update() {
        const wasDirty = this.dirty;
        this.dirty = false;
        return wasDirty;
    }
}

export default DirectionalLight;
