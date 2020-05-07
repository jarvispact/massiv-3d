export declare type ObjectData = {
    name: string;
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
};
export declare type ObjParserResult = {
    objects: ObjectData[];
};
export declare const parseObjFile: (fileContent: string) => ObjParserResult;
