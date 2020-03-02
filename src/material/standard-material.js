import { vec3 } from 'gl-matrix';

class StandardMaterial {
    constructor(options = {}) {
        this.diffuseColor = options.diffuseColor ? vec3.fromValues(...options.diffuseColor) : vec3.fromValues(0.74, 0.38, 0.41);
        this.specularColor = options.specularColor ? vec3.fromValues(...options.specularColor) : vec3.fromValues(1, 1, 1);
        this.ambientIntensity = options.ambientIntensity || 0.1;
        this.specularShininess = options.specularShininess || 256;
        this.diffuseMap = options.diffuseMap || null;
        this.specularMap = options.specularMap || null;
        this.opacity = options.opacity || 1;

        this.uniformUpdate = {
            diffuseColor: true,
            diffuseMap: true,
            specularColor: true,
            specularMap: true,
            ambientIntensity: true,
            specularShininess: true,
        };
    }

    setDiffuseColor(diffuseColor) {
        this.diffuseColor[0] = diffuseColor[0];
        this.diffuseColor[1] = diffuseColor[1];
        this.diffuseColor[2] = diffuseColor[2];
        this.uniformUpdate.diffuseColor = true;
    }

    getUniformUpdateFlag(name) {
        return this.uniformUpdate[name];
    }

    setUniformUpdateFlag(name, flag) {
        this.uniformUpdate[name] = flag;
    }
}

export default StandardMaterial;