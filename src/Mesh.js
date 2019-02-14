import Node from './Node';
import Geometry from './Geometry';
import Material from './Material';

export default class Mesh extends Node {
    constructor() {
        super();
        this.geometry = new Geometry();
        this.materials = [new Material()];
    }
}
