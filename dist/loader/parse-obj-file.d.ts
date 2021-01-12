export declare type ParsedObjPrimitive = {
    object: string;
    positions: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
    material: string;
    triangleCount: number;
};
export declare type ObjParserConfig = {
    flipUvX: boolean;
    flipUvY: boolean;
    splitObjectMode: 'object' | 'group';
};
export declare const createObjFileParser: (config?: Partial<ObjParserConfig> | undefined) => (objFileContent: string) => ParsedObjPrimitive[];
export declare const parseObjFile: (objFileContent: string) => ParsedObjPrimitive[];
