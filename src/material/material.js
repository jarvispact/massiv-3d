class Material {
    constructor() {
        this.indices = [];
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

    getShaderVersion() {
        return this.shaderVersion;
    }
}

export default Material;
