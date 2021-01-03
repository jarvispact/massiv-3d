import { vec2, vec3 } from 'gl-matrix';

export const computeTangents = (positions: Array<number>, indices: Array<number>, uvs: Array<number>) => {
    const tangents: Array<number> = new Array(positions.length);
    const bitangents: Array<number> = new Array(positions.length);

    for (let i = 0; i < indices.length; i += 3) {
        const idx1 = indices[i + 0];
        const idx2 = indices[i + 1];
        const idx3 = indices[i + 2];

        const pp1 = positions.slice(idx1 * 3, idx1 * 3 + 3);
        const pp2 = positions.slice(idx2 * 3, idx2 * 3 + 3);
        const pp3 = positions.slice(idx3 * 3, idx3 * 3 + 3);

        const p1 = vec3.fromValues(pp1[0], pp1[1], pp1[2]);
        const p2 = vec3.fromValues(pp2[0], pp2[1], pp2[2]);
        const p3 = vec3.fromValues(pp3[0], pp3[1], pp3[2]);


        const uuv1 = uvs.slice(idx1 * 2, idx1 * 2 + 2);
        const uuv2 = uvs.slice(idx2 * 2, idx2 * 2 + 2);
        const uuv3 = uvs.slice(idx3 * 2, idx3 * 2 + 2);

        const uv1 = vec2.fromValues(uuv1[0], uuv1[1]);
        const uv2 = vec2.fromValues(uuv2[0], uuv2[1]);
        const uv3 = vec2.fromValues(uuv3[0], uuv3[1]);
        
        const deltaPos1 = vec3.create();
        const deltaPos2 = vec3.create();
        vec3.subtract(deltaPos1, p2, p1);
        vec3.subtract(deltaPos2, p3, p1);

        const deltaUv1 = vec2.create();
        const deltaUv2 = vec2.create();
        vec2.subtract(deltaUv1, uv2, uv1);
        vec2.subtract(deltaUv2, uv3, uv1);

        const r = 1 / (deltaUv1[0] * deltaUv2[1] - deltaUv1[1] * deltaUv2[0]);

        const tangent = vec3.create();
        const bitangent = vec3.create();

        const tmp1 = vec3.create();
        const tmp2 = vec3.create();

        vec3.subtract(tangent, vec3.scale(tmp1, deltaPos1, deltaUv2[1]), vec3.scale(tmp2, deltaPos2, deltaUv1[1]));
        vec3.scale(tangent, tangent, r);

        vec3.subtract(bitangent, vec3.scale(tmp1, deltaPos2, deltaUv1[0]), vec3.scale(tmp2, deltaPos1, deltaUv2[0]));
        vec3.scale(bitangent, bitangent, r);

        vec3.normalize(tangent, tangent);
        vec3.normalize(bitangent, bitangent);

        tangents[idx1 * 3] = tangent[0];
        tangents[idx1 * 3 + 1] = tangent[1];
        tangents[idx1 * 3 + 2] = tangent[2];

        tangents[idx2 * 3] = tangent[0];
        tangents[idx2 * 3 + 1] = tangent[1];
        tangents[idx2 * 3 + 2] = tangent[2];

        tangents[idx3 * 3] = tangent[0];
        tangents[idx3 * 3 + 1] = tangent[1];
        tangents[idx3 * 3 + 2] = tangent[2];

        bitangents[idx1 * 3] = bitangent[0];
        bitangents[idx1 * 3 + 1] = bitangent[1];
        bitangents[idx1 * 3 + 2] = bitangent[2];

        bitangents[idx2 * 3] = bitangent[0];
        bitangents[idx2 * 3 + 1] = bitangent[1];
        bitangents[idx2 * 3 + 2] = bitangent[2];

        bitangents[idx3 * 3] = bitangent[0];
        bitangents[idx3 * 3 + 1] = bitangent[1];
        bitangents[idx3 * 3 + 2] = bitangent[2];
    }

    return { tangents, bitangents };
};
