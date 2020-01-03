import Component from './component';

class Geometry extends Component {
    constructor(vertices, normals, uvs, vertexColors) {
        super();
        this.vertices = vertices || [];
        this.normals = normals || [];
        this.uvs = uvs || [];
        this.vertexColors = vertexColors || [];

        this.vertexVectorSize = 3;
        this.normalVectorSize = 3;
        this.uvVectorSize = 2;
        this.vertexColorVectorSize = 4;
    }

    getVertices() {
        return this.vertices;
    }

    getVerticesAsFloat32Array() {
        return Float32Array.from(this.vertices);
    }

    setVertices(vertices) {
        this.vertices = vertices;
        return this;
    }

    getNormals() {
        return this.normals;
    }

    getNormalsAsFloat32Array() {
        return Float32Array.from(this.normals);
    }

    setNormals(normals) {
        this.normals = normals;
        return this;
    }

    getUvs() {
        return this.uvs;
    }

    getUvsAsFloat32Array() {
        return Float32Array.from(this.uvs);
    }

    setUvs(uvs) {
        this.uvs = uvs;
        return this;
    }

    getVertexColors() {
        return this.vertexColors;
    }

    getVertexColorsAsFloat32Array() {
        return Float32Array.from(this.vertexColors);
    }

    setVertexColors(vertexColors) {
        this.vertexColors = vertexColors;
        return this;
    }

    getVertexVectorSize() {
        return this.vertexVectorSize;
    }

    setVertexVectorSize(vertexVectorSize) {
        this.vertexVectorSize = vertexVectorSize;
        return this;
    }

    getNormalVectorSize() {
        return this.normalVectorSize;
    }

    setNormalVectorSize(normalVectorSize) {
        this.normalVectorSize = normalVectorSize;
        return this;
    }

    getUvVectorSize() {
        return this.uvVectorSize;
    }

    setUvVectorSize(uvVectorSize) {
        this.uvVectorSize = uvVectorSize;
        return this;
    }

    getVertexColorVectorSize() {
        return this.vertexColorVectorSize;
    }

    setVertexColorVectorSize(vertexColorVectorSize) {
        this.vertexColorVectorSize = vertexColorVectorSize;
        return this;
    }

    clone() {
        const clone = new Geometry();
        clone.setVertices([...this.vertices]);
        clone.setNormals([...this.normals]);
        clone.setUvs([...this.uvs]);
        clone.setVertexColors([...this.vertexColors]);

        clone.vertexVectorSize = this.vertexVectorSize;
        clone.normalVectorSize = this.normalVectorSize;
        clone.uvVectorSize = this.uvVectorSize;
        clone.vertexColorVectorSize = this.vertexColorVectorSize;

        return clone;
    }
}

export default Geometry;
