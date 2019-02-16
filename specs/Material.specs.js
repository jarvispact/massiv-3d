import { expect } from 'chai';
import Material from '../src/Material';

describe('Material', () => {
    it('should create a new instance of a Material', () => {
        const name = 'test-material';
        const material = new Material({ name });
        expect(material instanceof Material).to.equal(true);
        expect(material.name).to.equal(name);
        expect(material.ambientColor).to.eql([]);
        expect(material.diffuseColor).to.eql([]);
        expect(material.specularColor).to.eql([]);
        expect(material.specularExponent).to.equal(0.0);
        expect(material.positionIndices).to.eql([]);
        expect(material.normalIndices).to.eql([]);
        expect(material.uvIndices).to.eql([]);
    });
});
