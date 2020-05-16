import { GeometryData } from '../geometry/geometry';
export declare type ShaderSourceCode = {
    vertexShader: string;
    fragmentShader: string;
};
export declare type ShaderSourceArgs = {
    geometryData: GeometryData;
};
export interface Material {
    getUniformValue(uniformName: string): unknown | null;
    getTexture(gl: WebGL2RenderingContext, uniformName: string): WebGLTexture | null;
    getShaderSourceCode: ({ geometryData }: ShaderSourceArgs) => ShaderSourceCode;
}
