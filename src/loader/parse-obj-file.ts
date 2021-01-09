/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */

import { vec2, vec3 } from 'gl-matrix';
import { toFloat } from '../utils/to-float';
import { toInt } from '../utils/to-int';
import { ParsedMtlMaterial } from './parse-mtl-file';

const useMaterialRegex = /^usemtl\s(.*)$/;
const vertexPositionRegex = /^v\s+(\S+)\s(\S+)\s(\S+)$/;
const vertexUvRegex = /^vt\s+(\S+)\s(\S+).*$/;
const vertexNormalRegex = /^vn\s+(\S+)\s(\S+)\s(\S+)$/;
const triangleFaceRegex = /^f\s+(\S+)\s(\S+)\s(\S+)$/;
const quadFaceRegex = /^f\s+(\S+)\s(\S+)\s(\S+)\s(\S+)$/;
const vRegex = /^(\d{1,})$/;
const vnRegex = /^(\d{1,})\/\/(\d{1,})$/;
const vuRegex = /^(\d{1,})\/(\d{1,})$/;
const vnuRegex = /^(\d{1,})\/(\d{1,})\/(\d{1,})$/;

const correctIndex = (idx: number): number => idx - 1;

export type ParsedObjPrimitive = {
    name: string;
    positions: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
    indices: Array<number>;
    materialIndex: number;
    triangleCount: number;
};

export type ObjParserConfig = {
    flipUvX: boolean;
    flipUvY: boolean;
    splitPrimitiveMode: 'object' | 'group';
};

const defaultConfig: ObjParserConfig = {
    flipUvX: false,
    flipUvY: false,
    splitPrimitiveMode: 'object',
};

export const createObjFileParser = (config?: Partial<ObjParserConfig>) => {
    const cfg = config ? { ...defaultConfig, ...config } : defaultConfig;

    const primitiveRegex = cfg.splitPrimitiveMode === 'object' ? /^o\s(.*)$/ : /^g\s(.*)$/;

    return (objFileContent: string, materials: ParsedMtlMaterial[] = []): ParsedObjPrimitive[] => {
        const objDataLines = objFileContent.trim().split('\n');

        const cache: Record<string, number> = {};
        let indexCounter = 0;

        const allPositions: vec3[] = [];
        const allUvs: vec2[] = [];
        const allNormals: vec3[] = [];

        const primitives: ParsedObjPrimitive[] = [];

        const do_v_vertex = (primitive: ParsedObjPrimitive, p_index: number) => {
            const cached = cache[p_index];
            if (cached !== undefined) {
                primitive.indices.push(cached);
            } else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.indices.push(indexCounter);
                cache[p_index] = indexCounter;
                indexCounter += 1;
            }
        };

        const do_vu_vertex = (primitive: ParsedObjPrimitive, p_index: number, u_index: number) => {
            const cached = cache[`${p_index}-${u_index}`];
            if (cached !== undefined) {
                primitive.indices.push(cached);
            } else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.uvs.push(...[...allUvs[u_index]]);
                primitive.indices.push(indexCounter);
                cache[`${p_index}-${u_index}`] = indexCounter;
                indexCounter += 1;
            }
        };

        const do_vn_vertex = (primitive: ParsedObjPrimitive, p_index: number, n_index: number) => {
            const cached = cache[`${p_index}-${n_index}`];
            if (cached !== undefined) {
                primitive.indices.push(cached);
            } else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.normals.push(...[...allNormals[n_index]]);
                primitive.indices.push(indexCounter);
                cache[`${p_index}-${n_index}`] = indexCounter;
                indexCounter += 1;
            }
        };

        const do_vnu_vertex = (primitive: ParsedObjPrimitive, p_index: number, u_index: number, n_index: number) => {
            const cached = cache[`${p_index}-${u_index}-${n_index}`];
            if (cached !== undefined) {
                primitive.indices.push(cached);
            } else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.uvs.push(...[...allUvs[u_index]]);
                primitive.normals.push(...[...allNormals[n_index]]);
                primitive.indices.push(indexCounter);
                cache[`${p_index}-${u_index}-${n_index}`] = indexCounter;
                indexCounter += 1;
            }
        };

        for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
            const line = objDataLines[lineIndex].trim();
            if (!line) continue;

            // ========================================================
            // parse positions, normals and uvs into nested vec3 arrays

            const vertexPositionMatch = line.match(vertexPositionRegex);
            if (vertexPositionMatch) {
                const [, x, y, z] = vertexPositionMatch;
                allPositions.push([toFloat(x), toFloat(y), toFloat(z)]);
            }

            const vertexUvMatch = line.match(vertexUvRegex);
            if (vertexUvMatch) {
                const [, _x, _y] = vertexUvMatch;
                const x = toFloat(_x);
                const y = toFloat(_y);
                allUvs.push([cfg.flipUvX ? 1 - x : x, cfg.flipUvY ? 1 - y : y]);
            }

            const vertexNormalMatch = line.match(vertexNormalRegex);
            if (vertexNormalMatch) {
                const [, x, y, z] = vertexNormalMatch;
                allNormals.push([toFloat(x), toFloat(y), toFloat(z)]);
            }

            // =============================================
            // set materialIndex on current Primitive
            // and handle multi material objects

            const useMaterialMatch = line.match(useMaterialRegex);
            if (useMaterialMatch && materials.length) {
                const [, name] = useMaterialMatch;
                const currentMaterialIndex = materials.findIndex(m => m.name === name);
                const currentPrimitive = primitives[primitives.length - 1];
                if (currentPrimitive && currentPrimitive.indices.length === 0) {
                    currentPrimitive.materialIndex = currentMaterialIndex;
                } else if (currentPrimitive && currentPrimitive.indices.length > 0) {
                    primitives.push({ name: `${currentPrimitive.name}.MULTIMATERIAL.${currentMaterialIndex}`, positions: [], uvs: [], normals: [], indices: [], materialIndex: currentMaterialIndex, triangleCount: 0 });
                    indexCounter = 0;
                }
            }

            // ==============================================
            // ensure we are working on the correct primitive

            const primitiveMatch = line.match(primitiveRegex);
            if (primitiveMatch) {
                const [, name] = primitiveMatch;
                primitives.push({ name, positions: [], uvs: [], normals: [], indices: [], materialIndex: -1, triangleCount: 0 });

                const prevoiusPrimitive = primitives[primitives.length - 2];
                if (prevoiusPrimitive) indexCounter = 0;
            }

            const currentPrimitive = primitives[primitives.length - 1];
            
            // ====================
            // triangle face layout

            const triangleFaceMatch = line.match(triangleFaceRegex);
            if (triangleFaceMatch) {
                const [, v1, v2, v3] = triangleFaceMatch;

                // ====================
                // position only layout

                const v1_match = v1.match(vRegex);
                const v2_match = v2.match(vRegex);
                const v3_match = v3.match(vRegex);
                if (v1_match && v2_match && v3_match) {
                    const [, p_idx_1] = v1_match;
                    const [, p_idx_2] = v2_match;
                    const [, p_idx_3] = v3_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));

                    do_v_vertex(currentPrimitive, p_index_1);
                    do_v_vertex(currentPrimitive, p_index_2);
                    do_v_vertex(currentPrimitive, p_index_3);
                    currentPrimitive.triangleCount++;
                }

                // ======================
                // position and uv layout

                const vu1_match = v1.match(vuRegex);
                const vu2_match = v2.match(vuRegex);
                const vu3_match = v3.match(vuRegex);
                if (vu1_match && vu2_match && vu3_match) {
                    const [, p_idx_1, u_idx_1] = vu1_match;
                    const [, p_idx_2, u_idx_2] = vu2_match;
                    const [, p_idx_3, u_idx_3] = vu3_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const u_index_1 = correctIndex(toInt(u_idx_1));
                    const u_index_2 = correctIndex(toInt(u_idx_2));
                    const u_index_3 = correctIndex(toInt(u_idx_3));

                    do_vu_vertex(currentPrimitive, p_index_1, u_index_1);
                    do_vu_vertex(currentPrimitive, p_index_2, u_index_2);
                    do_vu_vertex(currentPrimitive, p_index_3, u_index_3);
                    currentPrimitive.triangleCount++;
                }

                // ==========================
                // position and normal layout

                const vn1_match = v1.match(vnRegex);
                const vn2_match = v2.match(vnRegex);
                const vn3_match = v3.match(vnRegex);
                if (vn1_match && vn2_match && vn3_match) {
                    const [, p_idx_1, n_idx_1] = vn1_match;
                    const [, p_idx_2, n_idx_2] = vn2_match;
                    const [, p_idx_3, n_idx_3] = vn3_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const n_index_1 = correctIndex(toInt(n_idx_1));
                    const n_index_2 = correctIndex(toInt(n_idx_2));
                    const n_index_3 = correctIndex(toInt(n_idx_3));

                    do_vn_vertex(currentPrimitive, p_index_1, n_index_1);
                    do_vn_vertex(currentPrimitive, p_index_2, n_index_2);
                    do_vn_vertex(currentPrimitive, p_index_3, n_index_3);
                    currentPrimitive.triangleCount++;
                }

                // ==============================
                // position, uv and normal layout

                const vnu1_match = v1.match(vnuRegex);
                const vnu2_match = v2.match(vnuRegex);
                const vnu3_match = v3.match(vnuRegex);
                if (vnu1_match && vnu2_match && vnu3_match) {
                    const [, p_idx_1, u_idx_1, n_idx_1] = vnu1_match;
                    const [, p_idx_2, u_idx_2, n_idx_2] = vnu2_match;
                    const [, p_idx_3, u_idx_3, n_idx_3] = vnu3_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const u_index_1 = correctIndex(toInt(u_idx_1));
                    const u_index_2 = correctIndex(toInt(u_idx_2));
                    const u_index_3 = correctIndex(toInt(u_idx_3));
                    const n_index_1 = correctIndex(toInt(n_idx_1));
                    const n_index_2 = correctIndex(toInt(n_idx_2));
                    const n_index_3 = correctIndex(toInt(n_idx_3));

                    do_vnu_vertex(currentPrimitive, p_index_1, u_index_1, n_index_1);
                    do_vnu_vertex(currentPrimitive, p_index_2, u_index_2, n_index_2);
                    do_vnu_vertex(currentPrimitive, p_index_3, u_index_3, n_index_3);
                    currentPrimitive.triangleCount++;
                }
            }

            // ================
            // quad face layout

            const quadFaceMatch = line.match(quadFaceRegex);
            if (quadFaceMatch) {
                const [, v1, v2, v3, v4] = quadFaceMatch;
                
                // ====================
                // position only layout

                const v1_match = v1.match(vRegex);
                const v2_match = v2.match(vRegex);
                const v3_match = v3.match(vRegex);
                const v4_match = v4.match(vRegex);
                if (v1_match && v2_match && v3_match && v4_match) {
                    const [, p_idx_1] = v1_match;
                    const [, p_idx_2] = v2_match;
                    const [, p_idx_3] = v3_match;
                    const [, p_idx_4] = v4_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const p_index_4 = correctIndex(toInt(p_idx_4));

                    do_v_vertex(currentPrimitive, p_index_1);
                    do_v_vertex(currentPrimitive, p_index_2);
                    do_v_vertex(currentPrimitive, p_index_3);
                    do_v_vertex(currentPrimitive, p_index_1);
                    do_v_vertex(currentPrimitive, p_index_3);
                    do_v_vertex(currentPrimitive, p_index_4);
                    currentPrimitive.triangleCount += 2;
                }

                // ======================
                // position and uv layout

                const vu1_match = v1.match(vuRegex);
                const vu2_match = v2.match(vuRegex);
                const vu3_match = v3.match(vuRegex);
                const vu4_match = v4.match(vuRegex);
                if (vu1_match && vu2_match && vu3_match && vu4_match) {
                    const [, p_idx_1, u_idx_1] = vu1_match;
                    const [, p_idx_2, u_idx_2] = vu2_match;
                    const [, p_idx_3, u_idx_3] = vu3_match;
                    const [, p_idx_4, u_idx_4] = vu4_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const p_index_4 = correctIndex(toInt(p_idx_4));
                    const u_index_1 = correctIndex(toInt(u_idx_1));
                    const u_index_2 = correctIndex(toInt(u_idx_2));
                    const u_index_3 = correctIndex(toInt(u_idx_3));
                    const u_index_4 = correctIndex(toInt(u_idx_4));

                    do_vu_vertex(currentPrimitive, p_index_1, u_index_1);
                    do_vu_vertex(currentPrimitive, p_index_2, u_index_2);
                    do_vu_vertex(currentPrimitive, p_index_3, u_index_3);
                    do_vu_vertex(currentPrimitive, p_index_1, u_index_1);
                    do_vu_vertex(currentPrimitive, p_index_3, u_index_3);
                    do_vu_vertex(currentPrimitive, p_index_4, u_index_4);
                    currentPrimitive.triangleCount += 2;
                }

                // ==========================
                // position and normal layout

                const vn1_match = v1.match(vnRegex);
                const vn2_match = v2.match(vnRegex);
                const vn3_match = v3.match(vnRegex);
                const vn4_match = v4.match(vnRegex);
                if (vn1_match && vn2_match && vn3_match && vn4_match) {
                    const [, p_idx_1, n_idx_1] = vn1_match;
                    const [, p_idx_2, n_idx_2] = vn2_match;
                    const [, p_idx_3, n_idx_3] = vn3_match;
                    const [, p_idx_4, n_idx_4] = vn4_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const p_index_4 = correctIndex(toInt(p_idx_4));
                    const n_index_1 = correctIndex(toInt(n_idx_1));
                    const n_index_2 = correctIndex(toInt(n_idx_2));
                    const n_index_3 = correctIndex(toInt(n_idx_3));
                    const n_index_4 = correctIndex(toInt(n_idx_4));

                    do_vn_vertex(currentPrimitive, p_index_1, n_index_1);
                    do_vn_vertex(currentPrimitive, p_index_2, n_index_2);
                    do_vn_vertex(currentPrimitive, p_index_3, n_index_3);
                    do_vn_vertex(currentPrimitive, p_index_1, n_index_1);
                    do_vn_vertex(currentPrimitive, p_index_3, n_index_3);
                    do_vn_vertex(currentPrimitive, p_index_4, n_index_4);
                    currentPrimitive.triangleCount += 2;
                    
                }

                // ==============================
                // position, uv and normal layout

                const vnu1_match = v1.match(vnuRegex);
                const vnu2_match = v2.match(vnuRegex);
                const vnu3_match = v3.match(vnuRegex);
                const vnu4_match = v4.match(vnuRegex);
                if (vnu1_match && vnu2_match && vnu3_match && vnu4_match) {
                    const [, p_idx_1, u_idx_1, n_idx_1] = vnu1_match;
                    const [, p_idx_2, u_idx_2, n_idx_2] = vnu2_match;
                    const [, p_idx_3, u_idx_3, n_idx_3] = vnu3_match;
                    const [, p_idx_4, u_idx_4, n_idx_4] = vnu4_match;

                    const p_index_1 = correctIndex(toInt(p_idx_1));
                    const p_index_2 = correctIndex(toInt(p_idx_2));
                    const p_index_3 = correctIndex(toInt(p_idx_3));
                    const p_index_4 = correctIndex(toInt(p_idx_4));
                    const u_index_1 = correctIndex(toInt(u_idx_1));
                    const u_index_2 = correctIndex(toInt(u_idx_2));
                    const u_index_3 = correctIndex(toInt(u_idx_3));
                    const u_index_4 = correctIndex(toInt(u_idx_4));
                    const n_index_1 = correctIndex(toInt(n_idx_1));
                    const n_index_2 = correctIndex(toInt(n_idx_2));
                    const n_index_3 = correctIndex(toInt(n_idx_3));
                    const n_index_4 = correctIndex(toInt(n_idx_4));           

                    do_vnu_vertex(currentPrimitive, p_index_1, u_index_1, n_index_1);
                    do_vnu_vertex(currentPrimitive, p_index_2, u_index_2, n_index_2);
                    do_vnu_vertex(currentPrimitive, p_index_3, u_index_3, n_index_3);
                    do_vnu_vertex(currentPrimitive, p_index_1, u_index_1, n_index_1);
                    do_vnu_vertex(currentPrimitive, p_index_3, u_index_3, n_index_3);
                    do_vnu_vertex(currentPrimitive, p_index_4, u_index_4, n_index_4);
                    currentPrimitive.triangleCount += 2;
                }
            }
        }
        
        return primitives;
    }
};

export const parseObjFile = createObjFileParser();