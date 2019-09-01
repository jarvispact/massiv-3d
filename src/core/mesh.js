import Transform3D from './transform-3d';

class Mesh extends Transform3D {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

export default Mesh;
