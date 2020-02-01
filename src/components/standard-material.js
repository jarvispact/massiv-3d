import { vec3 } from 'gl-matrix';
import Component from './component';
import ComponentTypes from './component-types';

class StandardMaterial extends Component {
    constructor(options = {}) {
        super(ComponentTypes.STANDARD_MATERIAL);
        this.indices = Uint32Array.from(options.indices || []);
        this.diffuseColor = options.diffuseColor ? vec3.fromValues(...options.diffuseColor) : vec3.fromValues(0.74, 0.38, 0.41);
        this.specularColor = options.specularColor ? vec3.fromValues(...options.specularColor) : vec3.fromValues(1, 1, 1);
        this.ambientIntensity = options.ambientIntensity || 0.1;
        this.specularExponent = options.specularExponent || 0.5;
        this.specularShininess = options.specularShininess || 256;
        this.diffuseMap = options.diffuseMap || null;
        this.specularMap = options.specularMap || null;
        this.dirty = true;
    }

    setDiffuseColor(r, g, b) {
        this.diffuseColor[0] = r;
        this.diffuseColor[1] = g;
        this.diffuseColor[2] = b;
        this.dirty = true;
    }

    update() {
        const wasDirty = this.dirty;
        this.dirty = false;
        return wasDirty;
    }
}

export default StandardMaterial;
