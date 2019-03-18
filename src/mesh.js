import Node3D from './node-3d';

export default class Mesh extends Node3D {
    constructor({ geometry, materials } = {}) {
        super();
        this.geometry = geometry;
        this.materials = materials;
    }
}
