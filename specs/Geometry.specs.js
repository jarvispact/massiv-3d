import { expect } from 'chai';
import Geometry from '../src/Geometry';

describe('Geometry', () => {
    it('should create a new instance of a Geometry', () => {
        const geometry = new Geometry();
        expect(geometry instanceof Geometry).to.equal(true);
        expect(geometry.positions).to.eql([]);
        expect(geometry.normals).to.eql([]);
        expect(geometry.uvs).to.eql([]);
    });
});
