export default class Material {
    constructor({ indices } = {}) {
        this.indices = indices || [];
    }

    getIndexBuffer() {
        return new Uint32Array(this.indices);
    }

    getIndexBufferLength() {
        return this.indices.length;
    }
}
