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
export declare const createVertexArray: (gl: WebGL2RenderingContext, cb: () => WebGLBuffer[]) => [WebGLVertexArrayObject, WebGLBuffer[]];
declare type TextureOptions = {
    level: number;
    internalFormat: number;
    srcFormat: number;
    srcType: number;
    generateMipmaps: boolean;
};
export declare const createTexture2D: (gl: WebGL2RenderingContext, image: HTMLImageElement, options?: Partial<TextureOptions> | undefined) => WebGLTexture;
export {};
