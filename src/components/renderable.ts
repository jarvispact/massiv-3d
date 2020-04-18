import { Component } from '../core/component';
import { Geometry } from '../core/geometry';
import { Material } from '../core/material';

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