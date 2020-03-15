class Geometry {
    constructor(options = {}) {
        this.positions = Float32Array.from(options.positions || []);
        this.normals = Float32Array.from(options.normals || []);
        this.uvs = Float32Array.from(options.uvs || []);
        this.colors = Float32Array.from(options.colors || []);
        this.indices = Uint32Array.from(options.indices || []);

        this.positionBufferSize = 3;
        this.normalBufferSize = 3;
        this.uvBufferSize = 2;
        this.colorBufferSize = 3;
    }
}

export default Geometry;
