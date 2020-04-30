import { Component } from '../core/component';
import { Geometry } from '../geometry/geometry';
import { Material } from '../material/material';

const type = 'Renderable';

type RenderableData = {
    material: Material;
    geometry: Geometry;
};

export class Renderable extends Component<typeof type, RenderableData> {
    constructor(args: RenderableData) {
        super(type, args);
    }
}