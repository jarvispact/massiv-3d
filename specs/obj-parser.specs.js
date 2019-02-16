import { expect } from 'chai';
import objParser from '../utils/obj-parser';
// import objFileContent from '../spec-files/obj-models/cube-with-triangulation-and-normals-and-uvs.obj';
// import mtlFileContent from '../spec-files/obj-models/cube-with-triangulation-and-normals-and-uvs.mtl';
import objFileContent from '../spec-files/obj-models/multiple-objects-with-multiple-materials.obj';
import mtlFileContent from '../spec-files/obj-models/multiple-objects-with-multiple-materials.mtl';

describe('objParser', () => {
    it('should parse a obj model', () => {
        const meshes = objParser(objFileContent, mtlFileContent);
        // meshes.forEach(mesh => console.log(mesh.geometry));
        // meshes.forEach(mesh => console.log(mesh.materials));
    });
});
