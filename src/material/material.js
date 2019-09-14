class Material {
    constructor({ indices } = {}) {
        this.indices = indices || [];
        this.shaderVersion = '#version 300 es\n\n';
    }

    getIndices() {
        return this.indices;
    }

    getIndicesAsUint32Array() {
        return new Uint32Array(this.indices);
    }

    setIndices(indices) {
        this.indices = indices;
        return this;
    }
}

export default Material;
