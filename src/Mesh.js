import Node from './Node';

export default class Mesh extends Node {
    constructor({ name, geometry, materials } = {}) {
        super();
        this.name = name;
        this.geometry = geometry;
        this.materials = Array.isArray(materials) ? materials : [materials];
    }
}
