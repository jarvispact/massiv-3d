import { vec2, vec3 } from 'gl-matrix';

export const computeTangents = (positions: Array<number>, uvs: Array<number>) => {
    const tangents: Array<number> = [];
    const bitangents: Array<number> = [];

    let uvIdx = 0;

    for (let i = 0; i < positions.length; i += 9) {
        const p1 = vec3.fromValues(positions[i + 0], positions[i + 1], positions[i + 2]);
        const p2 = vec3.fromValues(positions[i + 3], positions[i + 4], positions[i + 5]);
        const p3 = vec3.fromValues(positions[i + 6], positions[i + 7], positions[i + 8]);

        const uv1 = vec2.fromValues(uvs[uvIdx + 0], uvs[uvIdx + 1]);
        const uv2 = vec2.fromValues(uvs[uvIdx + 2], uvs[uvIdx + 3]);
        const uv3 = vec2.fromValues(uvs[uvIdx + 4], uvs[uvIdx + 5]);
        
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

        tangents.push(tangent[0], tangent[1], tangent[2]);
        tangents.push(tangent[0], tangent[1], tangent[2]);
        tangents.push(tangent[0], tangent[1], tangent[2]);

        bitangents.push(bitangent[0], bitangent[1], bitangent[2]);
        bitangents.push(bitangent[0], bitangent[1], bitangent[2]);
        bitangents.push(bitangent[0], bitangent[1], bitangent[2]);

        uvIdx += 6;
    }

    return { tangents, bitangents };
};
