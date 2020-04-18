import { Geometry } from '../core/geometry';

export class QuadGeometry extends Geometry {
    constructor() {
        super({
            positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            indices: [0, 1, 2, 0, 2, 3],
        });
    }
}