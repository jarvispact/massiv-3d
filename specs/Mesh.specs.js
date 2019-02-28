import { expect } from 'chai';
import Node from '../src/Node';
import Mesh from '../src/Mesh';
import Geometry from '../src/Geometry';
import Material from '../src/Material';

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
