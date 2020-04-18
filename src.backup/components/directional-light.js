import { vec3 } from 'gl-matrix';
import Component from './component';

class DirectionalLight extends Component {
    constructor(options = {}) {
        super();
        this.direction = options.direction ? vec3.fromValues(...options.direction) : vec3.fromValues(5, 5, 5);
        this.ambientColor = options.ambientColor ? vec3.fromValues(...options.ambientColor) : vec3.fromValues(1, 1, 1);
        this.diffuseColor = options.diffuseColor ? vec3.fromValues(...options.diffuseColor) : vec3.fromValues(1, 1, 1);
        this.specularColor = options.specularColor ? vec3.fromValues(...options.specularColor) : vec3.fromValues(1, 1, 1);
        this.intensity = options.intensity || 1.0;

        this.uniformUpdate = {
            direction: true,
            ambientColor: true,
            diffuseColor: true,
            specularColor: true,
            intensity: true,
        };
    }

    setDirection(direction) {
        this.direction[0] = direction[0];
        this.direction[1] = direction[1];
        this.direction[2] = direction[2];
        this.uniformUpdate.direction = true;
    }

    getUniformUpdateFlag(name) {
        return this.uniformUpdate[name];
    }

    markUniformsAsUpdated() {
        this.uniformUpdate.direction = false;
        this.uniformUpdate.ambientColor = false;
        this.uniformUpdate.diffuseColor = false;
        this.uniformUpdate.specularColor = false;
        this.uniformUpdate.intensity = false;
    }
}

export default DirectionalLight;