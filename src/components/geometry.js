import Component from './component';
import ComponentTypes from './component-types';

class Geometry extends Component {
    constructor(options = {}) {
        super(ComponentTypes.GEOMETRY);
        this.vertices = Float32Array.from(options.vertices || []);
        this.normals = Float32Array.from(options.normals || []);
        this.uvs = Float32Array.from(options.uvs || []);
        this.vertexColors = Float32Array.from(options.vertexColors || []);
    }
}

export default Geometry;
