import { expect } from 'chai';
import { parseMtlFile } from '../../src/loader/parse-mtl-file';

describe('parse-mtl-file', () => {
    it('should parse a mtl file', () => {
        const mtlFile = `
            # Blender MTL File: 'None'
            # Material Count: 1
    
            newmtl None
            Ns 500
            Ka 0.8 0.8 0.8
            Kd 0.8 0.8 0.8
            Ks 0.8 0.8 0.8
            d 1
            illum 2    
        `;

        const materials = parseMtlFile(mtlFile);
        expect(materials.length).to.eql(1);
        expect(materials[0].name).to.eql('None');
        expect(materials[0].diffuseColor).to.eql([0.8, 0.8, 0.8]);
        expect(materials[0].specularColor).to.eql([0.8, 0.8, 0.8]);
        expect(materials[0].specularExponent).to.eql(500);
        expect(materials[0].opacity).to.eql(1);
    });

    it('should parse more than one material', () => {
        const mtlFile = `
            # Blender MTL File: 'None'
            # Material Count: 2
            
            newmtl Material
            Ns 323.999994
            Ka 1.000000 1.000000 1.000000
            Kd 0.800000 0.013866 0.008235
            Ks 0.500000 0.500000 0.500000
            Ke 0.000000 0.000000 0.000000
            Ni 1.450000
            d 1.000000
            illum 2
            
            newmtl Material.001
            Ns 225.000000
            Ka 1.000000 1.000000 1.000000
            Kd 0.028677 0.053403 0.800000
            Ks 0.500000 0.500000 0.500000
            Ke 0.000000 0.000000 0.000000
            Ni 1.450000
            d 1.000000
            illum 2
        `;

        const materials = parseMtlFile(mtlFile);
        expect(materials.length).to.eql(2);
        expect(materials[0].name).to.eql('Material');
        expect(materials[0].diffuseColor).to.eql([0.8, 0.013866, 0.008235]);
        expect(materials[1].name).to.eql('Material.001');
        expect(materials[1].diffuseColor).to.eql([0.028677, 0.053403, 0.8]);
    });
});