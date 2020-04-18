import { Component } from '../core/component';
import { Geometry } from '../core/geometry';
import { Material } from '../core/material';
declare const type = "Renderable";
declare type RenderableData = {
    material: Material;
    geometry: Geometry;
};
export declare class Renderable extends Component<typeof type, RenderableData> {
    constructor(args: RenderableData);
}
export {};
