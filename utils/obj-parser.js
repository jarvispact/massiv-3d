import Geometry from '../src/Geometry';
import Material from '../src/Material';
import Mesh from '../src/Mesh';

const newMaterialRegex = /^newmtl\s(\S+)$/;
const specularExponentRegex = /^Ns\s(\S+)$/;
const ambientColorRegex = /^Ka\s(\S+)\s(\S+)\s(\S+)$/;
const diffuseColorRegex = /^Kd\s(\S+)\s(\S+)\s(\S+)$/;
const specularColorRegex = /^Ks\s(\S+)\s(\S+)\s(\S+)$/;

const newObjectRegex = /^o\s(\S+)$/;
const useMaterialRegex = /^usemtl\s(\S+)$/;
const positionRegex = /^v\s(\S+)\s(\S+)\s(\S+)$/;
const normalRegex = /^vn\s(\S+)\s(\S+)\s(\S+)$/;
const uvRegex = /^vt\s(\S+)\s(\S+)$/;

const triangleIndicesRegex = /^f\s(\S+)\s(\S+)\s(\S+)$/;
// const quadIndicesRegex = /^f\s(\S+)\s(\S+)\s(\S+)\s(\S)$/;

// const positionIndexRegex = /^(\d+)$/;
// const positionAndNormalIndexRegex = /^(\d+)\/\/(\d+)$/;
// const positionAndUvIndexRegex = /^(\d+)\/(\d+)$/;
const positionAndNormalAndUvIndexRegex = /^(\d+)\/(\d+)\/(\d+)$/;

const parseMaterials = (mtlFileLines) => {
    const materials = [];
    let materialIndex = -1;

    mtlFileLines.forEach((line) => {
        const newMaterialMatch = line.match(newMaterialRegex);
        if (newMaterialMatch) {
            materialIndex++;
            materials[materialIndex] = new Material({ name: newMaterialMatch[1] });
        }

        const specularExponentMatch = line.match(specularExponentRegex);
        if (specularExponentMatch) {
            materials[materialIndex].specularExponent = parseFloat(specularExponentMatch[1]);
        }

        const ambientColorMatch = line.match(ambientColorRegex);
        if (ambientColorMatch) {
            materials[materialIndex].ambientColor.push(parseFloat(ambientColorMatch[1]));
            materials[materialIndex].ambientColor.push(parseFloat(ambientColorMatch[2]));
            materials[materialIndex].ambientColor.push(parseFloat(ambientColorMatch[3]));
        }

        const diffuseColorMatch = line.match(diffuseColorRegex);
        if (diffuseColorMatch) {
            materials[materialIndex].diffuseColor.push(parseFloat(diffuseColorMatch[1]));
            materials[materialIndex].diffuseColor.push(parseFloat(diffuseColorMatch[2]));
            materials[materialIndex].diffuseColor.push(parseFloat(diffuseColorMatch[3]));
        }

        const specularColorMatch = line.match(specularColorRegex);
        if (specularColorMatch) {
            materials[materialIndex].specularColor.push(parseFloat(specularColorMatch[1]));
            materials[materialIndex].specularColor.push(parseFloat(specularColorMatch[2]));
            materials[materialIndex].specularColor.push(parseFloat(specularColorMatch[3]));
        }
    });

    return materials;
};

const parseMeshes = (objFileLines, materials) => {
    const meshes = [];
    let meshIndex = -1;
    let materialIndex = -1;

    objFileLines.forEach((line) => {
        const newObjectMatch = line.match(newObjectRegex);
        if (newObjectMatch) {
            meshIndex++;
            materialIndex = -1;
            meshes[meshIndex] = new Mesh({ name: newObjectMatch[1], geometry: new Geometry(), materials: [] });
        }

        const useMaterialMatch = line.match(useMaterialRegex);
        if (useMaterialMatch) {
            materialIndex++;
            meshes[meshIndex].materials[materialIndex] = materials.find(m => m.name === useMaterialMatch[1]);
        }

        const positionMatch = line.match(positionRegex);
        if (positionMatch) {
            meshes[meshIndex].geometry.positions.push(parseFloat(positionMatch[1]));
            meshes[meshIndex].geometry.positions.push(parseFloat(positionMatch[2]));
            meshes[meshIndex].geometry.positions.push(parseFloat(positionMatch[3]));
        }

        const normalMatch = line.match(normalRegex);
        if (normalMatch) {
            meshes[meshIndex].geometry.normals.push(parseFloat(normalMatch[1]));
            meshes[meshIndex].geometry.normals.push(parseFloat(normalMatch[2]));
            meshes[meshIndex].geometry.normals.push(parseFloat(normalMatch[3]));
        }

        const uvMatch = line.match(uvRegex);
        if (uvMatch) {
            meshes[meshIndex].geometry.uvs.push(parseFloat(uvMatch[1]));
            meshes[meshIndex].geometry.uvs.push(parseFloat(uvMatch[2]));
        }
    });

    return meshes;
};

const getVertexOffsetPerMesh = (objFileLines) => {
    let meshCounter = -1;

    let positionCounter = 0;
    let normalCounter = 0;
    let uvCounter = 0;

    const positionOffsets = [];
    const normalOffsets = [];
    const uvOffsets = [];

    const setVerticesPerMesh = (idx) => {
        positionOffsets[idx] = positionCounter;
        normalOffsets[idx] = normalCounter;
        uvOffsets[idx] = uvCounter;
    };

    objFileLines.forEach((line) => {
        const newObjectMatch = line.match(newObjectRegex);
        if (newObjectMatch) {
            meshCounter++;
            setVerticesPerMesh(meshCounter);
        }

        const positionMatch = line.match(positionRegex);
        if (positionMatch) positionCounter++;
        const normalMatch = line.match(normalRegex);
        if (normalMatch) normalCounter++;
        const uvMatch = line.match(uvRegex);
        if (uvMatch) uvCounter++;
    });

    setVerticesPerMesh(meshCounter + 1);
    return { positionOffsets, normalOffsets, uvOffsets };
};

const remap = offset => idxList => idxList.map(idx => idx - offset);

const extractIndices = (v1, v2, v3, { positionOffset, normalOffset, uvOffset }) => {
    // TODO: add support all formats: ['1', '1/1', '1//1', '1/1/1']
    const [, position1, uv1, normal1] = v1.match(positionAndNormalAndUvIndexRegex);
    const [, position2, uv2, normal2] = v2.match(positionAndNormalAndUvIndexRegex);
    const [, position3, uv3, normal3] = v3.match(positionAndNormalAndUvIndexRegex);

    const remapPositions = remap(positionOffset);
    const remapNormals = remap(normalOffset);
    const remapUvs = remap(uvOffset);

    const positionIndices = remapPositions([position1, position2, position3]);
    const normalIndices = remapNormals([normal1, normal2, normal3]);
    const uvIndices = remapUvs([uv1, uv2, uv3]);

    return { positionIndices, normalIndices, uvIndices };
};

const addIndicesToMeshes = (objFileLines, meshes, { positionOffsets, normalOffsets, uvOffsets }) => {
    let meshCounter = -1;
    let materialCounter = -1;

    objFileLines.forEach((line) => {
        const newObjectMatch = line.match(newObjectRegex);
        if (newObjectMatch) {
            meshCounter++;
            materialCounter = -1;
        }

        const useMaterialMatch = line.match(useMaterialRegex);
        if (useMaterialMatch) materialCounter++;

        // TODO: add support for quad faces
        const triangleFaceMatch = line.match(triangleIndicesRegex);
        if (triangleFaceMatch) {
            const [, v1, v2, v3] = triangleFaceMatch;

            const positionOffset = positionOffsets[meshCounter];
            const normalOffset = normalOffsets[meshCounter];
            const uvOffset = uvOffsets[meshCounter];
            const { positionIndices, normalIndices, uvIndices } = extractIndices(v1, v2, v3, { positionOffset, normalOffset, uvOffset });

            positionIndices.forEach(idx => meshes[meshCounter].materials[materialCounter].positionIndices.push(idx));
            normalIndices.forEach(idx => meshes[meshCounter].materials[materialCounter].normalIndices.push(idx));
            uvIndices.forEach(idx => meshes[meshCounter].materials[materialCounter].uvIndices.push(idx));
        }
    });
};

export default (objFileContent, mtlFileContent) => {
    const objFileLines = objFileContent.split('\n');
    const mtlFileLines = mtlFileContent.split('\n');
    const materials = parseMaterials(mtlFileLines);
    const meshes = parseMeshes(objFileLines, materials);

    const vertexOffsetPerMeshes = getVertexOffsetPerMesh(objFileLines);
    addIndicesToMeshes(objFileLines, meshes, vertexOffsetPerMeshes);
    return meshes;
};
