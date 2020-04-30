import { mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';

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

export const createVertexArray = (gl: WebGL2RenderingContext): WebGLVertexArrayObject => {
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('could not create vertex array object');
    gl.bindVertexArray(vao);
    return vao;
};

export const WEBGL2_DATA_TYPE = {
    MAT3: 'mat3',
    MAT4: 'mat4',
    VEC2: 'vec2',
    VEC3: 'vec3',
    VEC4: 'vec4',
    FLOAT: 'float',
    INT: 'int',
} as const;

export const UNIFORM = {
    MODEL_MATRIX: 'modelMatrix',
    VIEW_MATRIX: 'viewMatrix',
    PROJECTION_MATRIX: 'projectionMatrix',
    MODEL_VIEW_MATRIX: 'modelViewMatrix',
    MODEL_VIEW_PROJECTION_MATRIX: 'modelViewProjectionMatrix',
    CAMERA_POSITION: 'cameraPosition',
} as const;

export const webgl2TypeValues = Object.values(WEBGL2_DATA_TYPE);
export type WebGL2DataType = typeof webgl2TypeValues[0];

export const createUniformTypeLookupTable = (gl: WebGL2RenderingContext): Record<number, WebGL2DataType> => ({
    [gl.FLOAT_MAT3]: WEBGL2_DATA_TYPE.MAT3,
    [gl.FLOAT_MAT4]: WEBGL2_DATA_TYPE.MAT4,
    [gl.FLOAT_VEC2]: WEBGL2_DATA_TYPE.VEC2,
    [gl.FLOAT_VEC3]: WEBGL2_DATA_TYPE.VEC3,
    [gl.FLOAT_VEC4]: WEBGL2_DATA_TYPE.VEC4,
    [gl.FLOAT]: WEBGL2_DATA_TYPE.FLOAT,
    [gl.INT]: WEBGL2_DATA_TYPE.INT,
});

export type ActiveAttribute = {
    name: string;
    type: WebGL2DataType;
};

export type ActiveUniform = {
    name: string;
    type: WebGL2DataType;
    location: WebGLUniformLocation;
};

export type UniformTypeToUpdateUniformFunction = Record<WebGL2DataType, Function>;

export const uniformTypeToUpdateUniformFunction: UniformTypeToUpdateUniformFunction = {
    mat3: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => gl.uniformMatrix3fv(location, false, value as mat3),
    mat4: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => gl.uniformMatrix4fv(location, false, value as mat4),
    vec2: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => gl.uniform2fv(location, value as vec2),
    vec3: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => gl.uniform3fv(location, value as vec3),
    vec4: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => gl.uniform4fv(location, value as vec4),
    float: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => Array.isArray(value) ? gl.uniform1fv(location, value) : gl.uniform1f(location, value as number),
    int: (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: unknown): void => Array.isArray(value) ? gl.uniform1iv(location, value) : gl.uniform1i(location, value as number),
};

export const getActiveAttributes = (gl: WebGL2RenderingContext, program: WebGLProgram): ActiveAttribute[] => {
    const lookupTable = createUniformTypeLookupTable(gl);
    const activeAttributesCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    const attribs: ActiveAttribute[] = [];

    for (let i = 0; i < activeAttributesCount; i++) {
        const attributeInfo = gl.getActiveAttrib(program, i) as WebGLActiveInfo;
        attribs.push({
            name: attributeInfo.name,
            type: lookupTable[attributeInfo.type],
        });
    }

    return attribs;
};

export const getActiveUniforms = (gl: WebGL2RenderingContext, program: WebGLProgram): ActiveUniform[] => {
    const lookupTable = createUniformTypeLookupTable(gl);
    const activeUniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const uniforms: ActiveUniform[] = [];

    for (let i = 0; i < activeUniformsCount; i++) {
        const uniformInfo = gl.getActiveUniform(program, i) as WebGLActiveInfo;
        uniforms.push({
            name: uniformInfo.name,
            type: lookupTable[uniformInfo.type],
            location: gl.getUniformLocation(program, uniformInfo.name) as WebGLUniformLocation,
        });
    }

    return uniforms;
};

// const type = webglUniformTypeToUniformType[uniformInfo.type];
// const location = gl.getUniformLocation(program, uniformInfo.name);
// if (type === 'sampler2D') {
//     const texture = WebGL2Utils.createTexture(gl, renderable.material[uniformInfo.name]);
//     const sampler = new Sampler2D(gl, uniformInfo.name, location, texture);
//     sampler2Ds.push(sampler);
// } else {
//     const u = new Uniform(gl, uniformInfo.name, type, location);
//     uniforms.push(u);
// }

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