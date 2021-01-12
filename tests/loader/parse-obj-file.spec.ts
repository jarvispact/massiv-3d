import { expect } from 'chai';
import { parseObjFile } from '../../src/loader/parse-obj-file';
import { parseMtlFile } from '../../src/loader/parse-mtl-file';

describe('parse-obj-file', () => {
    describe('triangle face layout', () => {
        it('should parse a obj file with positions', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    s off
                    f 2 3 1
                    f 2 4 3
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(0);
            expect(primitives[0].normals.length).to.eql(0);
            expect(primitives[0].positions.length).to.eql(18);
        });

        it('should parse a obj file with positions and uvs', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vt 1.000000 0.000000
                    vt 0.000000 1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 1.000000
                    s off
                    f 2/1 3/2 1/3
                    f 2/1 4/4 3/2
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(12);
            expect(primitives[0].normals.length).to.eql(0);
            expect(primitives[0].positions.length).to.eql(18);
        });

        it('should parse a obj file with positions and normals', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vn 0.0000 1.0000 0.0000
                    s off
                    f 2//1 3//1 1//1
                    f 2//1 4//1 3//1                
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);            
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(0);
            expect(primitives[0].positions.length).to.eql(18);
            expect(primitives[0].normals.length).to.eql(18);
        });

        it('should parse a obj file with positions, normals and uvs', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vt 1.000000 0.000000
                    vt 0.000000 1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    s off
                    f 2/1/1 3/2/1 1/3/1
                    f 2/1/1 4/4/1 3/2/1
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(12);
            expect(primitives[0].positions.length).to.eql(18);
            expect(primitives[0].normals.length).to.eql(18);
        });
    });

    describe('quad face layout', () => {
        it('should parse a obj file with positions', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    s off
                    f 1 2 4 3
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(0);
            expect(primitives[0].normals.length).to.eql(0);
            expect(primitives[0].positions.length).to.eql(18);
        });

        it('should parse a obj file with positions and uvs', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    s off
                    f 1/1 2/2 4/3 3/4
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].normals.length).to.eql(0);
            expect(primitives[0].uvs.length).to.eql(12);
            expect(primitives[0].positions.length).to.eql(18);
        });

        it('should parse a obj file with positions and normals', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vn 0.0000 1.0000 0.0000
                    s off
                    f 1//1 2//1 4//1 3//1
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(0);
            expect(primitives[0].positions.length).to.eql(18);
            expect(primitives[0].normals.length).to.eql(18);
        });

        it('should parse a obj file with positions, normals and uvs', () => {
            const plane = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    s off
                    f 1/1/1 2/2/1 4/3/1 3/4/1
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(plane.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('none');
            expect(primitives[0].uvs.length).to.eql(12);
            expect(primitives[0].positions.length).to.eql(18);
            expect(primitives[0].normals.length).to.eql(18);
        });
    });

    describe('multiple objects', () => {
        it('should parse a obj file that contains multiple objects', () => {
            const multiple_objects = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    o Plane
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    v -1.000000 0.000000 -3.000000
                    v 1.000000 0.000000 -3.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    s off
                    f 1/1/1 2/2/1 4/3/1 3/4/1
                    o Plane.001
                    v -1.000000 0.000000 3.000000
                    v 1.000000 0.000000 3.000000
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    s off
                    f 5/5/2 6/6/2 8/7/2 7/8/2
                `,
                mtlFile: null,
            };

            const primitives = parseObjFile(multiple_objects.objFile);            
            expect(primitives.length).to.eql(2);

            expect(primitives[0].object).to.eql('Plane');
            expect(primitives[0].positions).to.eql([
                -1,  0, -1,  1,  0, -1, 1,
                 0, -3, -1,  0, -1,  1, 0,
                -3, -1,  0, -3
            ]);

            expect(primitives[1].object).to.eql('Plane.001');
            expect(primitives[1].positions).to.eql([
                -1,  0,  3, 1, 0, 3, 1,
                 0,  1, -1, 0, 3, 1, 0,
                 1, -1,  0, 1
            ]);
        });
    });

    describe('obj and mtl', () => {
        it('should parse a single primitive with a single material', () => {
            const primitive_with_material = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    mtllib plane_vnu_with_material.mtl
                    o Plane
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    usemtl None
                    s off
                    f 1/1/1 2/2/1 4/3/1 3/4/1
                `,
                mtlFile: `
                    # Blender MTL File: 'None'
                    # Material Count: 1
                    
                    newmtl None
                    Ns 500
                    Ka 0.8 0.8 0.8
                    Kd 0.8 0.8 0.8
                    Ks 0.8 0.8 0.8
                    d 1
                    illum 2    
                `,
            };

            const materials = parseMtlFile(primitive_with_material.mtlFile);
            expect(materials.length).to.eql(1);
            expect(materials[0].name).to.eql('None');

            const primitives = parseObjFile(primitive_with_material.objFile);
            expect(primitives.length).to.eql(1);
            expect(primitives[0].material).to.eql('None');
        });

        it('should parse 2 primitives with the same material', () => {
            const multiple_primitives_with_same_material = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    mtllib plane_vnu_multiple-objects_with_material.mtl
                    o Plane
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    v -1.000000 0.000000 -3.000000
                    v 1.000000 0.000000 -3.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    usemtl None
                    s off
                    f 1/1/1 2/2/1 4/3/1 3/4/1
                    o Plane.001
                    v -1.000000 0.000000 3.000000
                    v 1.000000 0.000000 3.000000
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    usemtl None
                    s off
                    f 5/5/2 6/6/2 8/7/2 7/8/2    
                `,
                mtlFile: `
                    # Blender MTL File: 'None'
                    # Material Count: 1
                    
                    newmtl None
                    Ns 500
                    Ka 0.8 0.8 0.8
                    Kd 0.8 0.8 0.8
                    Ks 0.8 0.8 0.8
                    d 1
                    illum 2      
                `,
            };

            const materials = parseMtlFile(multiple_primitives_with_same_material.mtlFile);
            expect(materials.length).to.eql(1);
            expect(materials[0].name).to.eql('None');

            const primitives = parseObjFile(multiple_primitives_with_same_material.objFile);
            expect(primitives.length).to.eql(2);
            expect(primitives[0].object).to.eql('Plane');
            expect(primitives[0].material).to.eql('None');
            expect(primitives[1].object).to.eql('Plane.001');
            expect(primitives[1].material).to.eql('None');
        });

        it('should parse 2 primitives with 2 materials', () => {
            const multiple_objects_with_different_material = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    mtllib plane_vnu_multiple-objects_with_different_material.mtl
                    o Plane
                    v -1.000000 0.000000 -1.000000
                    v 1.000000 0.000000 -1.000000
                    v -1.000000 0.000000 -3.000000
                    v 1.000000 0.000000 -3.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    usemtl Material
                    s off
                    f 1/1/1 2/2/1 4/3/1 3/4/1
                    o Plane.001
                    v -1.000000 0.000000 3.000000
                    v 1.000000 0.000000 3.000000
                    v -1.000000 0.000000 1.000000
                    v 1.000000 0.000000 1.000000
                    vt 0.000000 0.000000
                    vt 1.000000 0.000000
                    vt 1.000000 1.000000
                    vt 0.000000 1.000000
                    vn 0.0000 1.0000 0.0000
                    usemtl Material.001
                    s off
                    f 5/5/2 6/6/2 8/7/2 7/8/2        
                `,
                mtlFile: `
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
                `,
            };

            const materials = parseMtlFile(multiple_objects_with_different_material.mtlFile);
            expect(materials.length).to.eql(2);
            expect(materials[0].name).to.eql('Material');
            expect(materials[1].name).to.eql('Material.001');

            const primitives = parseObjFile(multiple_objects_with_different_material.objFile);
            expect(primitives.length).to.eql(2);
            expect(primitives[0].object).to.eql('Plane');
            expect(primitives[0].material).to.eql('Material');
            expect(primitives[1].object).to.eql('Plane.001');
            expect(primitives[1].material).to.eql('Material.001');
        });

        it('should parse a cube with multiple materials', () => {
            const cube_with_multi_material = {
                objFile: `
                    # Blender v2.83.3 OBJ File: ''
                    # www.blender.org
                    mtllib cube_with_multi_material.mtl
                    o Cube
                    v 1.000000 1.000000 -1.000000
                    v 1.000000 -1.000000 -1.000000
                    v 1.000000 1.000000 1.000000
                    v 1.000000 -1.000000 1.000000
                    v -1.000000 1.000000 -1.000000
                    v -1.000000 -1.000000 -1.000000
                    v -1.000000 1.000000 1.000000
                    v -1.000000 -1.000000 1.000000
                    vt 0.625000 0.500000
                    vt 0.875000 0.500000
                    vt 0.875000 0.750000
                    vt 0.625000 0.750000
                    vt 0.375000 0.750000
                    vt 0.625000 1.000000
                    vt 0.375000 1.000000
                    vt 0.375000 0.500000
                    vt 0.375000 0.000000
                    vt 0.625000 0.000000
                    vt 0.625000 0.250000
                    vt 0.375000 0.250000
                    vt 0.125000 0.500000
                    vt 0.125000 0.750000
                    vn 0.0000 1.0000 0.0000
                    vn 0.0000 0.0000 1.0000
                    vn 1.0000 0.0000 0.0000
                    vn -1.0000 0.0000 0.0000
                    vn 0.0000 -1.0000 0.0000
                    vn 0.0000 0.0000 -1.0000
                    usemtl Material
                    s off
                    f 1/1/1 5/2/1 7/3/1 3/4/1
                    f 4/5/2 3/4/2 7/6/2 8/7/2
                    f 2/8/3 1/1/3 3/4/3 4/5/3
                    usemtl Material.001
                    f 8/9/4 7/10/4 5/11/4 6/12/4
                    f 6/13/5 2/8/5 4/5/5 8/14/5
                    f 6/12/6 5/11/6 1/1/6 2/8/6
                `,
                mtlFile: `
                    # Blender MTL File: 'None'
                    # Material Count: 2
                    
                    newmtl Material
                    Ns 323.999994
                    Ka 1.000000 1.000000 1.000000
                    Kd 0.000000 0.023735 0.800000
                    Ks 0.500000 0.500000 0.500000
                    Ke 0.000000 0.000000 0.000000
                    Ni 1.450000
                    d 1.000000
                    illum 2
                    
                    newmtl Material.001
                    Ns 225.000000
                    Ka 1.000000 1.000000 1.000000
                    Kd 0.800000 0.024383 0.000000
                    Ks 0.500000 0.500000 0.500000
                    Ke 0.000000 0.000000 0.000000
                    Ni 1.450000
                    d 1.000000
                    illum 2
                `,
            };

            const materials = parseMtlFile(cube_with_multi_material.mtlFile);
            expect(materials.length).to.eql(2);
            expect(materials[0].name).to.eql('Material');
            expect(materials[1].name).to.eql('Material.001');

            const primitives = parseObjFile(cube_with_multi_material.objFile);
            expect(primitives.length).to.eql(2);
            expect(primitives[0].object).to.eql('Cube');
            expect(primitives[0].material).to.eql('Material');
            expect(primitives[1].object).to.eql('Cube');
            expect(primitives[1].material).to.eql('Material.001');
        });
    });
});