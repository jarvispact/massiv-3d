import Material from './material';

export default class BlinnPhongMaterial extends Material {
    constructor({ name, indices, diffuseTexture } = {}) {
        super({ name, indices });
        this.ambientColor = [];
        this.diffuseColor = [];
        this.specularColor = [];
        this.specularExponent = 0.0;
        this.diffuseTexture = diffuseTexture;
    }
}
