import { expect } from 'chai';
import Material from '../src/Material';

describe('Material', () => {
    it('should create a new instance of a Material', () => {
        const name = 'test-material';
        const material = new Material({ name });
        expect(material instanceof Material).to.equal(true);
        expect(material.name).to.equal(name);
        expect(material.indices).to.eql([]);
    });

    it('should get the indices as Uint32Array', () => {
        const material = new Material({ name: 'test', indices: [1, 2, 3] });
        const result = material.getIndicesBuffer();
        expect(result).to.eql(new Uint32Array([1, 2, 3]));
    });

    it('should get the indices length', () => {
        const material = new Material({ name: 'test', indices: [1, 2, 3] });
        const result = material.getIndicesLength();
        expect(result).to.equal(3);
    });
});
