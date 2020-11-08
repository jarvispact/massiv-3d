import { ParsedMtlMaterial } from './parse-mtl-file';
export declare type ParsedObjPrimitive = {
    name: string;
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
    materialIndex: number;
    triangleCount: number;
};
export declare const parseObjFile: (objFileContent: string, materials?: ParsedMtlMaterial[]) => ParsedObjPrimitive[];
