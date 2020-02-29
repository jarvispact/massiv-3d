import Geometry from './geometry';
import GeometryUtils from './geometry-utils';

const CubeGeometry = class extends Geometry {
    constructor() {
        super({
            positions: GeometryUtils.createCubePositions(),
            normals: GeometryUtils.createCubeNormals(),
            uvs: GeometryUtils.createCubeUvs(),
            indices: GeometryUtils.createCubeIndices(),
        });
    }
};

export default CubeGeometry;
