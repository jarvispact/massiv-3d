const objectRegex = /^o\s(.*)$/;
const materialRegex = /^usemtl\s(.*)$/;
const vertexPositionRegex = /^v\s(\S+)\s(\S+)\s(\S+)$/;
const vertexUvRegex = /^vt\s(\S+)\s(\S+)$/;
const vertexNormalRegex = /^vn\s(\S+)\s(\S+)\s(\S+)$/;
const faceRegex = /^f\s(\S+)\s(\S+)\s(\S+)$/;
const vnuRegex = /^(\d{1,})\/(\d{1,})\/(\d{1,})$/;

const toFloat = val => Number.parseFloat(val);
const toInt = val => Number.parseInt(val, 10);
const correctIndex = idx => idx - 1;

const ObjParser = {
    parse: (objData) => {
        const objDataLines = objData.trim().split('\n');

        const objects = [];
        let indexCounter = 0;

        for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
            const line = objDataLines[lineIndex].trim();

            const objectMatch = line.match(objectRegex);
            if (objectMatch) {
                const [, objectName] = objectMatch;
                objects.push({
                    name: objectName,
                    allVertices: [],
                    allUvs: [],
                    allNormals: [],
                    vertices: [],
                    uvs: [],
                    normals: [],
                    materials: [],
                });
            }

            const vertexPositionMatch = line.match(vertexPositionRegex);
            if (vertexPositionMatch) {
                const currentObject = objects[objects.length - 1];
                const [, x, y, z] = vertexPositionMatch;
                currentObject.allVertices.push([toFloat(x), toFloat(y), toFloat(z)]);
            }

            const vertexUvMatch = line.match(vertexUvRegex);
            if (vertexUvMatch) {
                const currentObject = objects[objects.length - 1];
                const [, x, y] = vertexUvMatch;
                currentObject.allUvs.push([toFloat(x), toFloat(y)]);
            }

            const vertexNormalMatch = line.match(vertexNormalRegex);
            if (vertexNormalMatch) {
                const currentObject = objects[objects.length - 1];
                const [, x, y, z] = vertexNormalMatch;
                currentObject.allNormals.push([toFloat(x), toFloat(y), toFloat(z)]);
            }

            const materialMatch = line.match(materialRegex);
            if (materialMatch) {
                const currentObject = objects[objects.length - 1];
                const [, materialName] = materialMatch;
                currentObject.materials.push({
                    name: materialName,
                    indices: [],
                });
            }

            const faceMatch = line.match(faceRegex);
            if (faceMatch) {
                const currentObject = objects[objects.length - 1];
                const currentMaterial = currentObject.materials[currentObject.materials.length - 1];
                const [, firstVertex, secondVertex, thirdVertex] = faceMatch;

                const firstVertexVnuMatch = firstVertex.match(vnuRegex);
                const secondVertexVnuMatch = secondVertex.match(vnuRegex);
                const thirdVertexVnuMatch = thirdVertex.match(vnuRegex);
                if (firstVertexVnuMatch && secondVertexVnuMatch && thirdVertexVnuMatch) {
                    const [, firstPositionIndex, firstUvIndex, firstNormalIndex] = firstVertexVnuMatch;
                    const [, secondPositionIndex, secondUvIndex, secondNormalIndex] = secondVertexVnuMatch;
                    const [, thirdPositionIndex, thirdUvIndex, thirdNormalIndex] = thirdVertexVnuMatch;

                    const vertices = [
                        ...currentObject.allVertices[correctIndex(toInt(firstPositionIndex))],
                        ...currentObject.allVertices[correctIndex(toInt(secondPositionIndex))],
                        ...currentObject.allVertices[correctIndex(toInt(thirdPositionIndex))],
                    ];

                    const uvs = [
                        ...currentObject.allUvs[correctIndex(toInt(firstUvIndex))],
                        ...currentObject.allUvs[correctIndex(toInt(secondUvIndex))],
                        ...currentObject.allUvs[correctIndex(toInt(thirdUvIndex))],
                    ];

                    const normals = [
                        ...currentObject.allNormals[correctIndex(toInt(firstNormalIndex))],
                        ...currentObject.allNormals[correctIndex(toInt(secondNormalIndex))],
                        ...currentObject.allNormals[correctIndex(toInt(thirdNormalIndex))],
                    ];

                    currentObject.vertices.push(...vertices);
                    currentObject.uvs.push(...uvs);
                    currentObject.normals.push(...normals);
                    currentMaterial.indices.push(indexCounter, indexCounter + 1, indexCounter + 2);
                    indexCounter += 3;
                }
            }
        }

        return objects;
    },
};

export default ObjParser;
