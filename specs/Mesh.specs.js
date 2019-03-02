import { expect } from 'chai';
import Node from '../src/node';
import Mesh from '../src/mesh';
import Geometry from '../src/geometry';
import Material from '../src/material';

describe('Mesh', () => {
    it('should create a new instance of a Mesh', () => {
        const geometry = new Geometry();
        const material = new Material();
        const name = 'test-mesh';
        const mesh = new Mesh({ name, geometry, materials: [material] });
        expect(mesh instanceof Node).to.equal(true);
        expect(mesh instanceof Mesh).to.equal(true);
        expect(mesh.name).to.equal(name);
        expect(mesh.geometry).to.equal(geometry);
        expect(mesh.materials[0]).to.equal(material);
    });
});
