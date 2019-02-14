import { expect } from 'chai';
import Material from '../src/Material';

describe('Material', () => {
    it('should create a new instance of a Material', () => {
        const material = new Material();
        expect(material instanceof Material).to.equal(true);
        expect(material.ambientColor).to.eql([]);
        expect(material.diffuseColor).to.eql([]);
        expect(material.specularColor).to.eql([]);
        expect(material.indices).to.eql([]);
    });
});
