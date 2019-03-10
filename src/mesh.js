import Node from './node';

export default class Mesh extends Node {
    constructor({ name, geometry, materials } = {}) {
        super();
        this.name = name;
        this.geometry = geometry;
        this.materials = materials;
    }
}
