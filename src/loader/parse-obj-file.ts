/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */

import { vec2, vec3 } from 'gl-matrix';
import { toFloat } from '../utils/to-float';
import { toInt } from '../utils/to-int';

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
    object: string;
    positions: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
    material: string;
    triangleCount: number;
};

export type ObjParserConfig = {
    flipUvX: boolean;
    flipUvY: boolean;
    splitObjectMode: 'object' | 'group';
};

const defaultConfig: ObjParserConfig = {
    flipUvX: false,
    flipUvY: false,
    splitObjectMode: 'object',
};

export const createObjFileParser = (config?: Partial<ObjParserConfig>) => {
    const cfg = config ? { ...defaultConfig, ...config } : defaultConfig;
    const objectRegex = cfg.splitObjectMode === 'object' ? /^o\s(.*)$/ : /^g\s(.*)$/;

    return (objFileContent: string): ParsedObjPrimitive[] => {
        const objDataLines = objFileContent.trim().split('\n');

        const allPositions: Array<vec3> = [];
        const allUvs: Array<vec2> = [];
        const allNormals: Array<vec3> = [];

        const do_v_vertex = (primitive: ParsedObjPrimitive, p_index: number) => {
            primitive.positions.push(...[...allPositions[p_index]]);
        };
        
        const do_vu_vertex = (primitive: ParsedObjPrimitive, p_index: number, u_index: number) => {
            primitive.positions.push(...[...allPositions[p_index]]);
            primitive.uvs.push(...[...allUvs[u_index]]);
        };
        
        const do_vn_vertex = (primitive: ParsedObjPrimitive, p_index: number, n_index: number) => {
            primitive.positions.push(...[...allPositions[p_index]]);
            primitive.normals.push(...[...allNormals[n_index]]);
        };
        
        const do_vnu_vertex = (primitive: ParsedObjPrimitive, p_index: number, u_index: number, n_index: number) => {    
            primitive.positions.push(...[...allPositions[p_index]]);
            primitive.uvs.push(...[...allUvs[u_index]]);
            primitive.normals.push(...[...allNormals[n_index]]);
        };

        const primitives: Array<ParsedObjPrimitive> = [];
        let useMaterials = false;
        let currentObject = 'default';

        for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
            const line = objDataLines[lineIndex].trim();
            if (!line) continue;
            if (line.startsWith('#')) continue;

            const useMaterialMatch = line.match(useMaterialRegex);
            if (useMaterialMatch) useMaterials = true;
        }

        for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
            const line = objDataLines[lineIndex].trim();
            if (!line) continue;
            if (line.startsWith('#')) continue;

            // ========================================================
            // ensure that we are working on the correct object / group

            const objectMatch = line.match(objectRegex);
            if (objectMatch) {
                const [, name] = objectMatch;
                currentObject = name;
            }

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

            // ===================================================
            // ensure that we are working on the correct primitive

            if (useMaterials) {
                const useMaterialMatch = line.match(useMaterialRegex);
                if (useMaterialMatch) {
                    const [, name] = useMaterialMatch;
                    primitives.push({ object: currentObject, positions: [], uvs: [], normals: [], material: name, triangleCount: 0 });
                }
            } else {
                const objectMatch = line.match(objectRegex);
                if (objectMatch) {
                    const [, name] = objectMatch;
                    primitives.push({ object: name, positions: [], uvs: [], normals: [], material: 'none', triangleCount: 0 });
                }
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

                    const primitive = currentPrimitive;
                    do_v_vertex(primitive, p_index_1);
                    do_v_vertex(primitive, p_index_2);
                    do_v_vertex(primitive, p_index_3);
                    primitive.triangleCount++;
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

                    const primitive = currentPrimitive;
                    do_vu_vertex(primitive, p_index_1, u_index_1);
                    do_vu_vertex(primitive, p_index_2, u_index_2);
                    do_vu_vertex(primitive, p_index_3, u_index_3);
                    primitive.triangleCount++;
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

                    const primitive = currentPrimitive;
                    do_vn_vertex(primitive, p_index_1, n_index_1);
                    do_vn_vertex(primitive, p_index_2, n_index_2);
                    do_vn_vertex(primitive, p_index_3, n_index_3);
                    primitive.triangleCount++;
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

                    const primitive = currentPrimitive;
                    do_vnu_vertex(primitive, p_index_1, u_index_1, n_index_1);
                    do_vnu_vertex(primitive, p_index_2, u_index_2, n_index_2);
                    do_vnu_vertex(primitive, p_index_3, u_index_3, n_index_3);
                    primitive.triangleCount++;
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

                    const primitive = currentPrimitive;
                    do_v_vertex(primitive, p_index_1);
                    do_v_vertex(primitive, p_index_2);
                    do_v_vertex(primitive, p_index_3);
                    do_v_vertex(primitive, p_index_1);
                    do_v_vertex(primitive, p_index_3);
                    do_v_vertex(primitive, p_index_4);
                    primitive.triangleCount += 2;
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

                    const primitive = currentPrimitive;
                    do_vu_vertex(primitive, p_index_1, u_index_1);
                    do_vu_vertex(primitive, p_index_2, u_index_2);
                    do_vu_vertex(primitive, p_index_3, u_index_3);
                    do_vu_vertex(primitive, p_index_1, u_index_1);
                    do_vu_vertex(primitive, p_index_3, u_index_3);
                    do_vu_vertex(primitive, p_index_4, u_index_4);
                    primitive.triangleCount += 2;
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

                    const primitive = currentPrimitive;
                    do_vn_vertex(primitive, p_index_1, n_index_1);
                    do_vn_vertex(primitive, p_index_2, n_index_2);
                    do_vn_vertex(primitive, p_index_3, n_index_3);
                    do_vn_vertex(primitive, p_index_1, n_index_1);
                    do_vn_vertex(primitive, p_index_3, n_index_3);
                    do_vn_vertex(primitive, p_index_4, n_index_4);
                    primitive.triangleCount += 2;
                    
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

                    const primitive = currentPrimitive;
                    do_vnu_vertex(primitive, p_index_1, u_index_1, n_index_1);
                    do_vnu_vertex(primitive, p_index_2, u_index_2, n_index_2);
                    do_vnu_vertex(primitive, p_index_3, u_index_3, n_index_3);
                    do_vnu_vertex(primitive, p_index_1, u_index_1, n_index_1);
                    do_vnu_vertex(primitive, p_index_3, u_index_3, n_index_3);
                    do_vnu_vertex(primitive, p_index_4, u_index_4, n_index_4);
                    primitive.triangleCount += 2;
                }
            }
        }
        
        return primitives;
    }
};

export const parseObjFile = createObjFileParser();