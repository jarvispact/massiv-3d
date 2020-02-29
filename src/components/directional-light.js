import { vec3 } from 'gl-matrix';
import Component from './component';

class DirectionalLight extends Component {
    constructor(options = {}) {
        super();
        this.direction = options.direction ? vec3.fromValues(...options.direction) : vec3.fromValues(5, 5, 5);
        this.ambientColor = options.ambientColor ? vec3.fromValues(...options.ambientColor) : vec3.fromValues(1, 1, 1);
        this.diffuseColor = options.diffuseColor ? vec3.fromValues(...options.diffuseColor) : vec3.fromValues(1, 1, 1);
        this.specularColor = options.specularColor ? vec3.fromValues(...options.specularColor) : vec3.fromValues(1, 1, 1);

        this.uniformUpdate = {
            direction: true,
            ambientColor: true,
            diffuseColor: true,
            specularColor: true,
        };
    }

    setDirection(direction) {
        this.direction[0] = direction[0];
        this.direction[1] = direction[1];
        this.direction[2] = direction[2];
        this.uniformUpdate.direction = true;
    }

    getUniformUpdateFlags() {
        return this.uniformUpdate;
    }

    getUniformUpdateFlag(name) {
        return this.uniformUpdate[name];
    }

    setUniformUpdateFlag(name, flag) {
        this.uniformUpdate[name] = flag;
    }
}

export default DirectionalLight;
