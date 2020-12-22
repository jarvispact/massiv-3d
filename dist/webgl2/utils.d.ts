import { mat4, mat3, vec3, vec4, vec2 } from 'gl-matrix';
export declare type WebGLContextAttributeOptions = {
    premultipliedAlpha: boolean;
    alpha: boolean;
    powerPreference: 'default' | 'low-power' | 'high-performance';
    antialias: boolean;
    desynchronized: boolean;
};
export declare const defaultContextAttributeOptions: WebGLContextAttributeOptions;
export declare const getWebgl2Context: (canvas: HTMLCanvasElement, contextAttributeOptions?: Partial<WebGLContextAttributeOptions> | undefined) => WebGL2RenderingContext;
export declare const createWebgl2Shader: (gl: WebGL2RenderingContext, type: number, source: string) => WebGLShader;
export declare const createWebgl2Program: (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => WebGLProgram;
export declare const createWebgl2ArrayBuffer: (gl: WebGL2RenderingContext, data: Float32Array) => WebGLBuffer;
export declare const setupWebgl2VertexAttribPointer: (gl: WebGL2RenderingContext, location: number, bufferSize: number, type?: number, stride?: number, offset?: number) => void;
export declare const createWebgl2ElementArrayBuffer: (gl: WebGL2RenderingContext, indices: Uint32Array) => WebGLBuffer;
export declare const createWebgl2VertexArray: (gl: WebGL2RenderingContext) => WebGLVertexArrayObject;
export declare type GLSL300Type = 'mat4' | 'mat3' | 'vec4' | 'vec3' | 'vec2' | 'float' | 'int';
export declare type GLSL300AttributeConfig = {
    name: string;
    type: GLSL300Type;
    location: number;
};
export declare type GLSL300InConfig = {
    name: string;
    type: GLSL300Type;
};
export declare type GLSL300OutConfig = {
    name: string;
    type: GLSL300Type;
};
export declare type GLSL300Config = {
    floatPrecision?: 'highp' | 'mediump';
    intPrecision?: 'highp' | 'mediump';
    attributes?: GLSL300AttributeConfig[];
    in?: GLSL300InConfig[];
    out?: GLSL300OutConfig[];
};
export declare const GLSL300ATTRIBUTE: Record<'POSITION' | 'UV' | 'NORMAL', GLSL300AttributeConfig>;
export declare const glsl300: (config?: GLSL300Config) => (source: TemplateStringsArray, ...interpolations: (string | number)[]) => {
    config: GLSL300Config;
    sourceCode: string;
};
export declare type Texture2DOptions = {
    level: number;
    internalFormat: number;
    srcFormat: number;
    srcType: number;
    generateMipmaps: boolean;
};
export declare const createTexture2D: (gl: WebGL2RenderingContext, image: HTMLImageElement, options?: Partial<Texture2DOptions> | undefined) => WebGLTexture;
export declare type UBOConfig = {
    [key: string]: mat4 | mat3 | vec4 | vec3 | vec3 | number;
};
export declare class UBO<T extends UBOConfig> {
    gl: WebGL2RenderingContext;
    webglBuffer: WebGLBuffer;
    bufferData: ArrayBuffer;
    blockName: string;
    binding: number;
    config: T;
    views: Record<string, Float32Array>;
    mat3BufferLayoutFuckup: number[];
    arrayCache: number[];
    constructor(gl: WebGL2RenderingContext, blockName: string, binding: number, config: T);
    bindToShaderProgram(shaderProgram: WebGLProgram): this;
    bindBase(): this;
    setMat4<Key extends string>(key: Key | keyof T, data: mat4): this;
    setMat3<Key extends string>(key: Key | keyof T, data: mat3): this;
    setVec4<Key extends string>(key: Key | keyof T, data: vec4): this;
    setVec3<Key extends string>(key: Key | keyof T, data: vec3): this;
    setVec2<Key extends string>(key: Key | keyof T, data: vec2): this;
    setScalar<Key extends string>(key: Key | keyof T, data: number): this;
    update(): this;
    cleanup(): this;
}
