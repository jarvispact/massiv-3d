export default class Material {
    constructor({ name, indices } = {}) {
        this.name = name;
        this.indices = indices || [];
    }

    getIndicesBuffer() {
        return new Uint32Array(this.indices);
    }

    getIndicesLength() {
        return this.indices.length;
    }
}
