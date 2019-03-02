export default class Geometry {
    constructor({ positions, normals, uvs, vertexColors } = {}) {
        this.positions = positions || [];
        this.normals = normals || [];
        this.uvs = uvs || [];
        this.vertexColors = vertexColors || [];
        this.positionsSize = 3;
        this.normalsSize = 3;
        this.uvsSize = 2;
        this.vertexColorsSize = 4;
    }

    getPositionsBuffer() {
        return new Float32Array(this.positions);
    }

    getPositionsBufferSize() {
        return this.positionsSize;
    }

    getNormalsBuffer() {
        return new Float32Array(this.normals);
    }

    getNormalsBufferSize() {
        return this.normalsSize;
    }

    getUvsBuffer() {
        return new Float32Array(this.uvs);
    }

    getUvsBufferSize() {
        return this.uvsSize;
    }

    getVertexColorsBuffer() {
        return new Float32Array(this.vertexColors);
    }

    getVertexColorsBufferSize() {
        return this.vertexColorsSize;
    }
}
