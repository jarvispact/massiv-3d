import { vec3 } from 'gl-matrix';
export declare type ParsedMtlMaterial = {
    name: string;
    ambientColor: vec3;
    diffuseColor: vec3;
    specularColor: vec3;
    specularExponent: number;
    opacity: number;
};
export declare const parseMtlFile: (mtlFileContent: string) => ParsedMtlMaterial[];
