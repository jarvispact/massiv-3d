import { mat4, mat3, vec3, vec4, vec2 } from 'gl-matrix';
import { Nullable } from '../types';

export type WebGLContextAttributeOptions = {
    premultipliedAlpha: boolean;
    alpha: boolean;
    powerPreference: 'default' | 'low-power' | 'high-performance';
    antialias: boolean;
    desynchronized: boolean;
};

export const defaultContextAttributeOptions: WebGLContextAttributeOptions = {
    premultipliedAlpha: false,
    alpha: false,
    powerPreference: 'high-performance',
    antialias: true,
    desynchronized: true,
};

export const getWebgl2Context = (canvas: HTMLCanvasElement, contextAttributeOptions?: Partial<WebGLContextAttributeOptions>): WebGL2RenderingContext => {
    const gl = canvas.getContext('webgl2', { ...defaultContextAttributeOptions, ...contextAttributeOptions || {} });
    if (!gl) throw new Error('cannot get webgl2 context');

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.colorMask(true, true, true, false);

    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return gl;
};

export const createWebgl2Shader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('could not create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('could not create shader');
};

export const createWebgl2Program = (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram => {
    const program = gl.createProgram();
    if (!program) throw new Error('could not create program');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('could not create program');
};

export const createWebgl2ArrayBuffer = (gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer => {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('could not create array buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
};

export const setupWebgl2VertexAttribPointer = (gl: WebGL2RenderingContext, location: number, bufferSize: number, type = gl.FLOAT, stride = 0, offset = 0) => {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, bufferSize, type, false, stride, offset);
};

export const createWebgl2ElementArrayBuffer = (gl: WebGL2RenderingContext, indices: Uint32Array): WebGLBuffer => {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('could not create element array buffer');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return buffer;
};

export const createWebgl2VertexArray = (gl: WebGL2RenderingContext): WebGLVertexArrayObject => {
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('could not create vertex array object');
    gl.bindVertexArray(vao);
    return vao;
};

export type GLSL300Type = 'mat4' | 'mat3' | 'vec4' | 'vec3' | 'vec2' | 'float' | 'int';

export type GLSL300AttributeConfig = {
    name: string;
    type: GLSL300Type;
    location: number;
};

export type GLSL300InConfig = {
    name: string;
    type: GLSL300Type;
};

export type GLSL300OutConfig = {
    name: string;
    type: GLSL300Type;
};

export type GLSL300Config = {
    floatPrecision?: 'highp' | 'mediump';
    intPrecision?: 'highp' | 'mediump';
    attributes?: GLSL300AttributeConfig[];
    in?: GLSL300InConfig[];
    out?: GLSL300OutConfig[];
};

const defaultGLSL300Config: GLSL300Config = {
    floatPrecision: 'highp',
    intPrecision: 'highp',
};

export const GLSL300ATTRIBUTE: Record<'POSITION' | 'UV' | 'NORMAL' | 'COLOR', GLSL300AttributeConfig> = {
    POSITION: { name: 'position', type: 'vec3', location: 0 },
    UV: { name: 'uv', type: 'vec2', location: 1 },
    NORMAL: { name: 'normal', type: 'vec3', location: 2 },
    COLOR: { name: 'color', type: 'vec3', location: 3 },
};

export const glsl300 = (config: GLSL300Config = {}) => (source: TemplateStringsArray, ...interpolations: (string | number)[]) => {
    const version = '#version 300 es';
    const floatPrecision = `precision ${config.floatPrecision || defaultGLSL300Config.floatPrecision} float;`;
    const intPrecision = `precision ${config.intPrecision || defaultGLSL300Config.intPrecision} int;`;
    const uniformLayoutDeclaration = 'layout(std140, column_major) uniform;';
    let header = `${version}\n\n${floatPrecision}\n${intPrecision}\n\n${uniformLayoutDeclaration}\n\n`;

    const attributeDeclarations = (config.attributes || []).reduce((accum, attr) => {
        accum += `layout(location = ${attr.location}) in ${attr.type} ${attr.name};\n`;
        return accum;
    }, '');

    const inDeclarations = (config.in || []).reduce((accum, declaration) => {
        accum += `in ${declaration.type} ${declaration.name};\n`;
        return accum;
    }, '');

    const outDeclarations = (config.out || []).reduce((accum, declaration) => {
        accum += `out ${declaration.type} ${declaration.name};\n`;
        return accum;
    }, '');

    if (attributeDeclarations) header += attributeDeclarations;
    if (inDeclarations) header += inDeclarations;
    if (outDeclarations) header += outDeclarations;

    const sourceCode = source.reduce((accum, chunk, idx) => {
        accum += `${chunk}${interpolations[idx] || ''}`;
        return accum;
    }, header);

    return {
        config,
        sourceCode,
    };
};

export type Texture2DOptions = {
    level: number;
    internalFormat: number;
    srcFormat: number;
    srcType: number;
    generateMipmaps: boolean;
};

export const createTexture2D = (gl: WebGL2RenderingContext, image: HTMLImageElement, options?: Partial<Texture2DOptions>): WebGLTexture => {
    const texture = gl.createTexture();
    if (!texture) throw new Error('could not create texture');
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const defaultOptions: Texture2DOptions = {
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

// ==================================
// Uniform Buffer

// WTF is this shit?
const fixupUniformBufferIssue = (uniformBufferNormalMatrix: number[], normalMatrix: mat3) => {
    uniformBufferNormalMatrix[0] = normalMatrix[0];
    uniformBufferNormalMatrix[1] = normalMatrix[1];
    uniformBufferNormalMatrix[2] = normalMatrix[2];
    uniformBufferNormalMatrix[3] = 0;

    uniformBufferNormalMatrix[4] = normalMatrix[3];
    uniformBufferNormalMatrix[5] = normalMatrix[4];
    uniformBufferNormalMatrix[6] = normalMatrix[5];
    uniformBufferNormalMatrix[7] = 0;

    uniformBufferNormalMatrix[8] = normalMatrix[6];
    uniformBufferNormalMatrix[9] = normalMatrix[7];
    uniformBufferNormalMatrix[10] = normalMatrix[8];
    uniformBufferNormalMatrix[11] = 0;
};

export type UBOConfig = {
    [key: string]: mat4 | mat3 | vec4 | vec3 | vec3 | number;
};

export class UBO<T extends UBOConfig> {
    gl: WebGL2RenderingContext;
    webglBuffer!: WebGLBuffer;
    bufferData!: ArrayBuffer;
    blockName: string;
    binding: number;
    config: T;
    views: Record<string, Float32Array> = {};
    mat3BufferLayoutFuckup = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    arrayCache = [0];

    constructor(gl: WebGL2RenderingContext, blockName: string, binding: number, config: T) {
        this.gl = gl;
        this.blockName = blockName;
        this.binding = binding;
        this.config = config;
    }

    bindToShaderProgram(shaderProgram: WebGLProgram) {
        const gl = this.gl;
        const blockIndex = gl.getUniformBlockIndex(shaderProgram, this.blockName);
        gl.uniformBlockBinding(shaderProgram, blockIndex, this.binding);

        if (!this.bufferData) {
            const blockSize = gl.getActiveUniformBlockParameter(shaderProgram, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
            this.bufferData = new ArrayBuffer(blockSize);

            const namesFromConfig = Object.keys(this.config);
            const uniformIndices = gl.getUniformIndices(shaderProgram, namesFromConfig) as Iterable<number>;
            const uniformOffsets = gl.getActiveUniforms(shaderProgram, uniformIndices, gl.UNIFORM_OFFSET) as Nullable<number[]>;
            if (!uniformOffsets) throw new Error('invalid ubo config');

            this.views = namesFromConfig.reduce((accum, name, idx) => {
                if (typeof this.config[name] === 'number') {
                    this.arrayCache[0] = this.config[name] as number;
                    accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], 1);
                    accum[name].set(this.arrayCache);
                } else if ((this.config[name] as Array<number>).length === 9) {
                    accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], 12);
                    fixupUniformBufferIssue(this.mat3BufferLayoutFuckup, this.config[name] as mat3);
                    accum[name].set(this.mat3BufferLayoutFuckup);
                } else {
                    accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], (this.config[name] as Array<number>).length);
                    accum[name].set((this.config[name] as Array<number>));
                }

                return accum;
            }, {} as Record<string, Float32Array>);

            this.webglBuffer = gl.createBuffer() as WebGLBuffer;
            gl.bindBuffer(gl.UNIFORM_BUFFER, this.webglBuffer);
            gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, gl.DYNAMIC_DRAW);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.binding, this.webglBuffer);
        }

        return this;
    }

    bindBase() {
        const gl = this.gl;
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.binding, this.webglBuffer);
        return this;
    }

    setMat4<Key extends string>(key: Key | keyof T, data: mat4) {
        this.views[key as string].set(data);
        return this;
    }

    setMat3<Key extends string>(key: Key | keyof T, data: mat3) {
        fixupUniformBufferIssue(this.mat3BufferLayoutFuckup, data);
        this.views[key as string].set(this.mat3BufferLayoutFuckup);
        return this;
    }

    setVec4<Key extends string>(key: Key | keyof T, data: vec4) {
        this.views[key as string].set(data);
        return this;
    }

    setVec3<Key extends string>(key: Key | keyof T, data: vec3) {
        this.views[key as string].set(data);
        return this;
    }

    setVec2<Key extends string>(key: Key | keyof T, data: vec2) {
        this.views[key as string].set(data);
        return this;
    }

    setScalar<Key extends string>(key: Key | keyof T, data: number) {
        this.arrayCache[0] = data;
        this.views[key as string].set(this.arrayCache);
        return this;
    }

    update() {    
        const gl = this.gl;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.webglBuffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.bufferData);
        return this;
    }

    cleanup() {
        this.gl.deleteBuffer(this.webglBuffer);
        return this;
    }
}