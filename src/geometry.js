export default class Geometry {
    constructor({ positions, normals, uvs, colors } = {}) {
        this.positions = positions || [];
        this.normals = normals || [];
        this.uvs = uvs || [];
        this.colors = colors || [];
        this.positionsSize = 3;
        this.normalsSize = 3;
        this.uvsSize = 2;
        this.colorsSize = 3;
    }

    getPositionBuffer() {
        return new Float32Array(this.positions);
    }

    getPositionBufferSize() {
        return this.positionsSize;
    }

    getNormalBuffer() {
        return new Float32Array(this.normals);
    }

    getNormalBufferSize() {
        return this.normalsSize;
    }

    getUvBuffer() {
        return new Float32Array(this.uvs);
    }

    getUvBufferSize() {
        return this.uvsSize;
    }

    getColorBuffer() {
        return new Float32Array(this.colors);
    }

    getColorBufferSize() {
        return this.colorsSize;
    }
}
