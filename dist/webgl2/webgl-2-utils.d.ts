export declare const createShader: (gl: WebGL2RenderingContext, type: number, source: string) => WebGLShader;
export declare const createProgram: (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => WebGLProgram;
export declare const createArrayBuffer: (gl: WebGL2RenderingContext, data: Float32Array, location: number, bufferSize: number) => WebGLBuffer;
export declare const createElementArrayBuffer: (gl: WebGL2RenderingContext, indices: Uint32Array) => WebGLBuffer;
export declare const createVertexArray: (gl: WebGL2RenderingContext, cb: () => WebGLBuffer[]) => [WebGLVertexArrayObject, WebGLBuffer[]];
