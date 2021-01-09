import { ParsedMtlMaterial } from './parse-mtl-file';
export declare type ParsedObjPrimitive = {
    name: string;
    positions: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
    indices: Array<number>;
    materialIndex: number;
    triangleCount: number;
};
export declare type ObjParserConfig = {
    flipUvX: boolean;
    flipUvY: boolean;
    splitPrimitiveMode: 'object' | 'group';
};
export declare const createObjFileParser: (config?: Partial<ObjParserConfig> | undefined) => (objFileContent: string, materials?: ParsedMtlMaterial[]) => ParsedObjPrimitive[];
export declare const parseObjFile: (objFileContent: string, materials?: ParsedMtlMaterial[]) => ParsedObjPrimitive[];
