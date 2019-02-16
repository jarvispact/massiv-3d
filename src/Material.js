export default class Material {
    constructor({ name } = {}) {
        this.name = name;
        this.ambientColor = [];
        this.diffuseColor = [];
        this.specularColor = [];
        this.specularExponent = 0.0;
        this.positionIndices = [];
        this.normalIndices = [];
        this.uvIndices = [];
    }
}
