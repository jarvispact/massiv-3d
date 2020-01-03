import Material from './material';
import Vec3 from '../math/vec3';

class StandardMaterial extends Material {
    constructor(indices, diffuseColor, specularColor, ambientIntensity, specularExponent, specularShininess) {
        super(indices);
        this.ambientIntensity = ambientIntensity || 0.1;
        this.diffuseColor = diffuseColor || new Vec3(1, 0, 0);
        this.specularColor = specularColor || new Vec3(1, 1, 1);
        this.specularExponent = specularExponent || 0.5;
        this.specularShininess = specularShininess || 256;
    }

    getAmbientIntensity() {
        return this.ambientIntensity;
    }

    setAmbientIntensity(ambientIntensity) {
        this.ambientIntensity = ambientIntensity;
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

    getSpecularExponent() {
        return this.specularExponent;
    }

    setSpecularExponent(specularExponent) {
        this.specularExponent = specularExponent;
        return this;
    }

    getSpecularShininess() {
        return this.specularShininess;
    }

    setSpecularShininess(specularShininess) {
        this.specularShininess = specularShininess;
        return this;
    }

    clone() {
        const clone = new StandardMaterial();
        clone.setIndices([...this.indices]);
        clone.ambientIntensity = this.ambientIntensity;
        clone.diffuseColor = this.diffuseColor.clone();
        clone.specularColor = this.specularColor.clone();
        clone.specularExponent = this.specularExponent;
        clone.specularShininess = this.specularShininess;
        return clone;
    }
}

export default StandardMaterial;
