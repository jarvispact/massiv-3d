import Vec2 from '../math/vec2';
import Vec3 from '../math/vec3';

// TODO add support for mtl files

const mtlFileRegex = /^mtllib\s(\S+)$/; // eslint-disable-line no-unused-vars
const useMtlRegex = /^usemtl\s(\S+)$/;
const objNameRegex = /^o\s(\S+)$/;
const vertexRegex = /^v\s(\S+)\s(\S+)\s(\S+)$/;
const normalRegex = /^vn\s(\S+)\s(\S+)\s(\S+)$/;
const uvRegex = /^vt\s(\S+)\s(\S+)$/;
const triangleFaceRegex = /^f\s(\S+)\s(\S+)\s(\S+)$/;
const triangleVertexRegex = /^(\d+)\/(\d+)\/(\d+)$/;

const parse = (objFileString) => {
    console.log(objFileString.trim());
    const lines = objFileString.trim().split('\n');

    const allVertices = [];
    const allNormals = [];
    const allUvs = [];

    // parse shared vertices, normals and uvs
    lines.forEach((line) => {
        const vertexMatch = line.match(vertexRegex);
        if (vertexMatch) {
            const [, x, y, z] = vertexMatch;
            allVertices.push(new Vec3(x, y, z));
        }

        const normalMatch = line.match(normalRegex);
        if (normalMatch) {
            const [, x, y, z] = normalMatch;
            allNormals.push(new Vec3(x, y, z));
        }

        const uvMatch = line.match(uvRegex);
        if (uvMatch) {
            const [, x, y] = uvMatch;
            allUvs.push(new Vec2(x, y));
        }
    });

    console.log({ allVertices, allNormals, allUvs });


    // parse objects with materials
    const objects = [];
    let currentObjectIndex = 0;
    let currentMaterialIndex = 0;

    lines.forEach((line) => {
        const objMatch = line.match(objNameRegex);
        if (objMatch) {
            const [, objName] = objMatch;

            objects[currentObjectIndex] = {
                name: objName,
                vertices: [],
                normals: [],
                uvs: [],
                materials: [],
            };

            currentObjectIndex++;
        }

        const lastObjIndex = currentObjectIndex - 1;

        const useMtlMatch = line.match(useMtlRegex);
        if (useMtlMatch) {
            const [, materialName] = useMtlMatch;

            objects[lastObjIndex].materials[currentMaterialIndex] = {
                name: materialName,
                indices: [],
            };

            currentMaterialIndex++;
        }

        const lastMaterialIndex = currentMaterialIndex - 1;

        const triangleFaceMatch = line.match(triangleFaceRegex);
        if (triangleFaceMatch) {
            const [, one, two, three] = triangleFaceMatch;
            const oneMatch = one.match(triangleVertexRegex);
            if (oneMatch) {
                const [, vertexIndex, uvIndex, normalIndex] = oneMatch;
                console.log('one', { vertexIndex, uvIndex, normalIndex });
                const realVertexIndex = vertexIndex - 1;
                const realNormalIndex = normalIndex - 1;
                const realUvIndex = uvIndex - 1;
                objects[lastObjIndex].vertices.push(...allVertices[realVertexIndex].getAsArray());
                objects[lastObjIndex].normals.push(...allNormals[realNormalIndex].getAsArray());
                objects[lastObjIndex].uvs.push(...allUvs[realUvIndex].getAsArray());
                objects[lastObjIndex].materials[lastMaterialIndex].indices.push(realVertexIndex);
            }

            const twoMatch = two.match(triangleVertexRegex);
            if (twoMatch) {
                const [, vertexIndex, uvIndex, normalIndex] = twoMatch;
                console.log('two', { vertexIndex, uvIndex, normalIndex });
            }

            const threeMatch = three.match(triangleVertexRegex);
            if (threeMatch) {
                const [, vertexIndex, uvIndex, normalIndex] = threeMatch;
                console.log('three', { vertexIndex, uvIndex, normalIndex });
            }
        }
    });

    console.log({ objects });

    return objects;
};


const ObjLoader = {
    load: (objFilePath) => fetch(objFilePath).then(response => response.text()).then(parse),
};

export default ObjLoader;
