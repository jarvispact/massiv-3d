import { Material } from '../material/material';
export declare type WebGLContextAttributeOptions = {
    premultipliedAlpha: boolean;
    alpha: boolean;
    powerPreference: 'default' | 'low-power' | 'high-performance';
    antialias: boolean;
    desynchronized: boolean;
};
export declare type WebGL2Options = {
    depthFunc: number;
    blendEquation: number;
    blendFuncSFactor: number;
    blendFuncDFactor: number;
    cullFace: number;
    depthTestEnabled: boolean;
    blendEnabled: boolean;
    cullFaceEnabled: boolean;
};
export declare const defaultContextAttributeOptions: WebGLContextAttributeOptions;
export declare const getDefaultWebGL2Options: (gl: WebGL2RenderingContext) => WebGL2Options;
export declare const getWebGL2Context: (canvas: HTMLCanvasElement, contextAttributeOptions?: Partial<WebGLContextAttributeOptions> | undefined, getWebGL2Options?: ((gl: WebGL2RenderingContext) => Partial<WebGL2Options>) | undefined) => WebGL2RenderingContext;
export declare const createShader: (gl: WebGL2RenderingContext, type: number, source: string) => WebGLShader;
export declare const createProgram: (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => WebGLProgram;
export declare const createArrayBuffer: (gl: WebGL2RenderingContext, data: Float32Array, location: number, bufferSize: number) => WebGLBuffer;
export declare const createElementArrayBuffer: (gl: WebGL2RenderingContext, indices: Uint32Array) => WebGLBuffer;
export declare const createVertexArray: (gl: WebGL2RenderingContext) => WebGLVertexArrayObject;
export declare const WEBGL2_DATA_TYPE: {
    readonly MAT3: "mat3";
    readonly MAT4: "mat4";
    readonly VEC2: "vec2";
    readonly VEC3: "vec3";
    readonly VEC4: "vec4";
    readonly FLOAT: "float";
    readonly INT: "int";
    readonly SAMPLER_2D: "sampler2D";
};
export declare const ATTRIBUTE: {
    readonly POSITION: {
        readonly LOCATION: 0;
        readonly NAME: "position";
    };
    readonly UV: {
        readonly LOCATION: 1;
        readonly NAME: "uv";
    };
    readonly NORMAL: {
        readonly LOCATION: 2;
        readonly NAME: "normal";
    };
};
export declare const UNIFORM: {
    readonly MODEL_MATRIX: "modelMatrix";
    readonly VIEW_MATRIX: "viewMatrix";
    readonly PROJECTION_MATRIX: "projectionMatrix";
    readonly MODEL_VIEW_MATRIX: "modelViewMatrix";
    readonly MODEL_VIEW_PROJECTION_MATRIX: "modelViewProjectionMatrix";
    readonly NORMAL_MATRIX: "normalMatrix";
    readonly CAMERA_POSITION: "cameraPosition";
    readonly DIR_LIGHT_COUNT: "dirLightCount";
    readonly DIR_LIGHT_DIRECTION: "dirLightDirections";
    readonly DIR_LIGHT_COLOR: "dirLightColors";
    readonly DIR_LIGHT_INTENSITY: "dirLightIntensities";
};
export declare const webgl2TypeValues: ("mat3" | "mat4" | "vec2" | "vec3" | "vec4" | "float" | "int" | "sampler2D")[];
export declare type WebGL2DataType = typeof webgl2TypeValues[0];
export declare const createUniformTypeLookupTable: (gl: WebGL2RenderingContext) => Record<number, "mat3" | "mat4" | "vec2" | "vec3" | "vec4" | "float" | "int" | "sampler2D">;
export declare type TextureOptions = {
    level: number;
    internalFormat: number;
    srcFormat: number;
    srcType: number;
    generateMipmaps: boolean;
};
export declare const createTexture2D: (gl: WebGL2RenderingContext, image: HTMLImageElement, options?: Partial<TextureOptions> | undefined) => WebGLTexture;
export declare type ActiveAttribute = {
    name: string;
    type: WebGL2DataType;
};
export declare type ActiveUniform = {
    name: string;
    type: WebGL2DataType;
    location: WebGLUniformLocation;
};
export declare type ActiveSampler2D = {
    name: string;
    type: WebGL2DataType;
    location: WebGLUniformLocation;
    texture: WebGLTexture;
};
export declare const getActiveAttributes: (gl: WebGL2RenderingContext, program: WebGLProgram) => ActiveAttribute[];
declare type ActiveUniformResult = {
    uniforms: ActiveUniform[];
    samplers2D: ActiveSampler2D[];
};
export declare const getActiveUniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, material: Material) => ActiveUniformResult;
export {};
