const objectRegex = /^o\s(.*)$/;
const vertexPositionRegex = /^v\s(\S+)\s(\S+)\s(\S+)$/;
const vertexUvRegex = /^vt\s(\S+)\s(\S+)$/;
const vertexNormalRegex = /^vn\s(\S+)\s(\S+)\s(\S+)$/;
const faceRegex = /^f\s(\S+)\s(\S+)\s(\S+)$/;
const vnuRegex = /^(\d{1,})\/(\d{1,})\/(\d{1,})$/;
const vnRegex = /^(\d{1,})\/\/(\d{1,})$/;

const toFloat = val => Number.parseFloat(val);
const toInt = val => Number.parseInt(val, 10);
const correctIndex = idx => idx - 1;

const ObjParser = {
    parse: (objData) => {
        const objDataLines = objData.trim().split('\n');

        const allPositions = [];
        const allUvs = [];
        const allNormals = [];
        const objects = [];
        let indexCounter = 0;

        for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
            const line = objDataLines[lineIndex].trim();

            const objectMatch = line.match(objectRegex);
            if (objectMatch) {
                const [, name] = objectMatch;
                objects.push({ name, positions: [], uvs: [], normals: [], indices: [] });
                indexCounter = 0;
            }

            const vertexPositionMatch = line.match(vertexPositionRegex);
            if (vertexPositionMatch) {
                const [, x, y, z] = vertexPositionMatch;
                allPositions.push([toFloat(x), toFloat(y), toFloat(z)]);
            }

            const vertexUvMatch = line.match(vertexUvRegex);
            if (vertexUvMatch) {
                const [, x, y] = vertexUvMatch;
                allUvs.push([toFloat(x), toFloat(y)]);
            }

            const vertexNormalMatch = line.match(vertexNormalRegex);
            if (vertexNormalMatch) {
                const [, x, y, z] = vertexNormalMatch;
                allNormals.push([toFloat(x), toFloat(y), toFloat(z)]);
            }

            const faceMatch = line.match(faceRegex);
            if (faceMatch) {
                const currentObject = objects[objects.length - 1];
                const [, firstVertex, secondVertex, thirdVertex] = faceMatch;

                // VERTEX/UV/NORMAL
                const firstVertexVnuMatch = firstVertex.match(vnuRegex);
                const secondVertexVnuMatch = secondVertex.match(vnuRegex);
                const thirdVertexVnuMatch = thirdVertex.match(vnuRegex);
                if (firstVertexVnuMatch && secondVertexVnuMatch && thirdVertexVnuMatch) {
                    const [, firstPositionIndex, firstUvIndex, firstNormalIndex] = firstVertexVnuMatch;
                    const [, secondPositionIndex, secondUvIndex, secondNormalIndex] = secondVertexVnuMatch;
                    const [, thirdPositionIndex, thirdUvIndex, thirdNormalIndex] = thirdVertexVnuMatch;

                    const positions = [
                        ...allPositions[correctIndex(toInt(firstPositionIndex))],
                        ...allPositions[correctIndex(toInt(secondPositionIndex))],
                        ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                    ];

                    const uvs = [
                        ...allUvs[correctIndex(toInt(firstUvIndex))],
                        ...allUvs[correctIndex(toInt(secondUvIndex))],
                        ...allUvs[correctIndex(toInt(thirdUvIndex))],
                    ];

                    const normals = [
                        ...allNormals[correctIndex(toInt(firstNormalIndex))],
                        ...allNormals[correctIndex(toInt(secondNormalIndex))],
                        ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                    ];

                    currentObject.positions.push(...positions);
                    currentObject.uvs.push(...uvs);
                    currentObject.normals.push(...normals);
                    currentObject.indices.push(indexCounter, indexCounter + 1, indexCounter + 2);
                    indexCounter += 3;
                }

                // VERTEX//NORMAL
                const firstVertexVnMatch = firstVertex.match(vnRegex);
                const secondVertexVnMatch = secondVertex.match(vnRegex);
                const thirdVertexVnMatch = thirdVertex.match(vnRegex);
                if (firstVertexVnMatch && secondVertexVnMatch && thirdVertexVnMatch) {
                    const [, firstPositionIndex, firstNormalIndex] = firstVertexVnMatch;
                    const [, secondPositionIndex, secondNormalIndex] = secondVertexVnMatch;
                    const [, thirdPositionIndex, thirdNormalIndex] = thirdVertexVnMatch;

                    const positions = [
                        ...allPositions[correctIndex(toInt(firstPositionIndex))],
                        ...allPositions[correctIndex(toInt(secondPositionIndex))],
                        ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                    ];

                    const normals = [
                        ...allNormals[correctIndex(toInt(firstNormalIndex))],
                        ...allNormals[correctIndex(toInt(secondNormalIndex))],
                        ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                    ];

                    currentObject.positions.push(...positions);
                    currentObject.normals.push(...normals);
                    currentObject.indices.push(indexCounter, indexCounter + 1, indexCounter + 2);
                    indexCounter += 3;
                }
            }
        }

        return objects;
    },
};

export default ObjParser;
