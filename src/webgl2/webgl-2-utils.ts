export type WebGLContextAttributeOptions = {
    premultipliedAlpha: boolean;
    alpha: boolean;
    powerPreference: 'default' | 'low-power' | 'high-performance';
    antialias: boolean;
    desynchronized: boolean;
};

export type WebGL2Options = {
    depthFunc: number;
    blendEquation: number;
    blendFuncSFactor: number;
    blendFuncDFactor: number;
    cullFace: number;
    depthTestEnabled: boolean;
    blendEnabled: boolean;
    cullFaceEnabled: boolean;
};

export const defaultContextAttributeOptions: WebGLContextAttributeOptions = {
    premultipliedAlpha: false,
    alpha: false,
    powerPreference: 'high-performance',
    antialias: true,
    desynchronized: true,
};

export const getDefaultWebGL2Options = (gl: WebGL2RenderingContext): WebGL2Options => ({
    depthFunc: gl.LEQUAL,
    blendEquation: gl.FUNC_ADD,
    blendFuncSFactor: gl.SRC_ALPHA,
    blendFuncDFactor: gl.ONE_MINUS_SRC_ALPHA,
    cullFace: gl.BACK,
    depthTestEnabled: true,
    blendEnabled: false,
    cullFaceEnabled: false,
});

export const getWebGL2Context = (canvas: HTMLCanvasElement, contextAttributeOptions?: Partial<WebGLContextAttributeOptions>, getWebGL2Options?: (gl: WebGL2RenderingContext) => Partial<WebGL2Options>): WebGL2RenderingContext => {
    const gl = canvas.getContext('webgl2', { ...defaultContextAttributeOptions, ...contextAttributeOptions || {} });
    if (!gl) throw new Error('cannot get webgl2 context');

    const options: WebGL2Options = { ...getDefaultWebGL2Options(gl), ...getWebGL2Options ? getWebGL2Options(gl) : {} };    

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.colorMask(true, true, true, false);

    gl.depthFunc(options.depthFunc);
    gl.blendEquation(options.blendEquation);
    gl.blendFunc(options.blendFuncSFactor, options.blendFuncDFactor);
    gl.cullFace(options.cullFace);

    if (options.depthTestEnabled) {
        gl.enable(gl.DEPTH_TEST);
    } else {
        gl.disable(gl.DEPTH_TEST);
    }

    if (options.blendEnabled) {
        gl.enable(gl.BLEND);
    } else {
        gl.disable(gl.BLEND);
    }

    if (options.cullFaceEnabled) {
        gl.enable(gl.CULL_FACE);
    } else {
        gl.disable(gl.CULL_FACE);
    }

    return gl;
};

// export const glsl = (sourceCode: TemplateStringsArray, ...interpolations: unknown[]) => {
//     console.log({ sourceCode, interpolations });
//     return sourceCode;
// };

export const createShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('could not create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error('could not create shader');
    }
    return shader;
};

export const createProgram = (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram => {
    const program = gl.createProgram();
    if (!program) throw new Error('could not create program');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error('could not create program');
    }
    return program;
};

export const createArrayBuffer = (gl: WebGL2RenderingContext, data: Float32Array, location: number, bufferSize: number): WebGLBuffer => {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('could not create array buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, bufferSize, gl.FLOAT, false, 0, 0);
    return buffer;
};

export const createElementArrayBuffer = (gl: WebGL2RenderingContext, indices: Uint32Array): WebGLBuffer => {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('could not create element array buffer');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return buffer;
};

export const createVertexArray = (gl: WebGL2RenderingContext, cb: () => WebGLBuffer[]): [WebGLVertexArrayObject, WebGLBuffer[]] => {
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('could not create vertex array object');
    gl.bindVertexArray(vao);
    const buffers = cb();
    return [vao, buffers];
};

export const UNIFORM_TYPE = {
    MAT4: 'mat4',
    MAT3: 'mat3',
    VEC2: 'vec2',
    VEC3: 'vec3',
    VEC4: 'vec4',
    FLOAT: 'float',
    INT: 'int',
} as const;

export const uniformTypeValues = Object.values(UNIFORM_TYPE);
export type UniformType = typeof uniformTypeValues[0];
export type UniformTypeLookupTable = Record<number, UniformType>;

export const createUniformTypeLookupTable = (gl: WebGL2RenderingContext): UniformTypeLookupTable => ({
    [gl.FLOAT_MAT4]: UNIFORM_TYPE.MAT4,
    [gl.FLOAT_MAT3]: UNIFORM_TYPE.MAT3,
    [gl.FLOAT_VEC2]: UNIFORM_TYPE.VEC2,
    [gl.FLOAT_VEC3]: UNIFORM_TYPE.VEC3,
    [gl.FLOAT_VEC4]: UNIFORM_TYPE.VEC4,
    [gl.FLOAT]: UNIFORM_TYPE.FLOAT,
    [gl.INT]: UNIFORM_TYPE.INT,
});

type TextureOptions = {
    level: number;
    internalFormat: number;
    srcFormat: number;
    srcType: number;
    generateMipmaps: boolean;
};

export const createTexture2D = (gl: WebGL2RenderingContext, image: HTMLImageElement, options?: Partial<TextureOptions>): WebGLTexture => {
    const texture = gl.createTexture();
    if (!texture) throw new Error('could not create texture');
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const defaultOptions: TextureOptions = {
        level: 0,
        internalFormat: gl.RGBA,
        srcFormat: gl.RGBA,
        srcType: gl.UNSIGNED_BYTE,
        generateMipmaps: true,
    };

    const texOptions = { ...defaultOptions, ...options };

    gl.texImage2D(gl.TEXTURE_2D, texOptions.level, texOptions.internalFormat, texOptions.srcFormat, texOptions.srcType, image);
    if (texOptions.generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
};