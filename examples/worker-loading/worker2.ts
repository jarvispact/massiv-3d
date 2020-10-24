import { FileLoader, parseMtlFile, parseObjFile } from '../../src';

self.addEventListener('message', async (event: WorkerEventMap['message']) => {
    if (event.data === 'load-models') {
        const [objFileContent, mtlFileContent] = await Promise.all([
            FileLoader.load('./dragon.obj'),
            FileLoader.load('./dragon.mtl'),
        ]);
    
        const materials = parseMtlFile(mtlFileContent);
        const primitives = parseObjFile(objFileContent, materials);

        const positionsLength = primitives[0].positions.length;
        const normalsLength = primitives[0].normals.length;
        const uvsLength = primitives[0].uvs.length;
        const indicesLength = primitives[0].indices.length;

        const positionsSize = positionsLength * Float32Array.BYTES_PER_ELEMENT;
        const normalsSize = normalsLength * Float32Array.BYTES_PER_ELEMENT;
        const uvsSize = uvsLength * Float32Array.BYTES_PER_ELEMENT;
        const indicesSize = indicesLength * Uint32Array.BYTES_PER_ELEMENT;
        const totalSize = positionsSize + normalsSize + uvsSize + indicesSize;

        const sab = new SharedArrayBuffer(totalSize);

        const data = {
            buffer: sab,
            positions: { offset: 0, length: primitives[0].positions.length },
            normals: { offset: positionsSize, length: primitives[0].normals.length },
            uvs: { offset: positionsSize + normalsSize, length: primitives[0].uvs.length },
            indices: { offset: positionsSize + normalsSize + uvsSize, length: primitives[0].indices.length }
        };

        const positions = new Float32Array(sab, data.positions.offset, data.positions.length);
        const normals = new Float32Array(sab, data.normals.offset, data.normals.length);
        const uvs = new Float32Array(sab, data.uvs.offset, data.uvs.length);
        const indices = new Uint32Array(sab, data.indices.offset, data.indices.length);

        positions.set(primitives[0].positions);
        normals.set(primitives[0].normals);
        uvs.set(primitives[0].uvs);
        indices.set(primitives[0].indices);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        self.postMessage(data);
    }
});