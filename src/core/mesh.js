import Transform3D from './transform-3d';
import Geometry from './geometry';
import StandardMaterial from '../material/standard-material';

class Mesh extends Transform3D {
    constructor({ geometry, material } = {}) {
        super();
        this.geometry = geometry || new Geometry();
        this.material = material || new StandardMaterial();
    }
}

export default Mesh;
