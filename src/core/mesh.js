import Transform3D from './transform-3d';
import Geometry from './geometry';
import StandardMaterial from '../material/standard-material';

class Mesh extends Transform3D {
    constructor({ geometry, material } = {}) {
        super();
        this.geometry = geometry || new Geometry();
        this.material = material || new StandardMaterial();
    }

    clone() {
        const clone = new Mesh();
        clone.geometry = this.geometry.clone();
        clone.material = this.material.clone();
        return clone;
    }
}

export default Mesh;
