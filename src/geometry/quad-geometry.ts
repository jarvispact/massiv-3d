import { Geometry, GeometryData } from './geometry';

export class QuadGeometry implements Geometry {
    getData(): GeometryData {
        return {
            positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            indices: [0, 1, 2, 0, 2, 3],
            normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            uvs: [0, 0, 1, 0, 1, 1, 0, 1],
            colors: null,
        };
    }
}