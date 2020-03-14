/* eslint-disable no-console, no-confusing-arrow */

const arrayBufferLookupTable = {
    position: (geometry) => ({
        location: 0,
        bufferData: geometry.positions,
        bufferSize: geometry.positionBufferSize,
    }),
    uv: (geometry) => ({
        location: 1,
        bufferData: geometry.uvs,
        bufferSize: geometry.uvBufferSize,
    }),
    normal: (geometry) => ({
        location: 2,
        bufferData: geometry.normals,
        bufferSize: geometry.normalBufferSize,
    }),
    color: (geometry) => ({
        location: 3,
        bufferData: geometry.colors,
        bufferSize: geometry.colorBufferSize,
    }),
};

const createArrayBuffer = (gl, type, geometry) => {
    const result = arrayBufferLookupTable[type](geometry);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, result.bufferData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(result.location);
    gl.vertexAttribPointer(result.location, result.bufferSize, gl.FLOAT, false, 0, 0);
    return buffer;
};

const createElementArrayBuffer = (gl, material) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, material.indices, gl.STATIC_DRAW);
    return buffer;
};

const createVertexArray = (gl, geometry, attribs) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let positionBuffer = null;
    let uvBuffer = null;
    let normalBuffer = null;
    let colorBuffer = null;

    const hasPositions = attribs.includes('position') && geometry.positions && geometry.positions.length > 0;
    if (hasPositions) {
        positionBuffer = createArrayBuffer(gl, 'position', geometry);
    }

    const hasUvs = attribs.includes('uv') && geometry.uvs && geometry.uvs.length > 0;
    if (hasUvs) {
        uvBuffer = createArrayBuffer(gl, 'uv', geometry);
    }

    const hasNormals = attribs.includes('normal') && geometry.normals && geometry.normals.length > 0;
    if (hasNormals) {
        normalBuffer = createArrayBuffer(gl, 'normal', geometry);
    }

    const hasColors = attribs.includes('color') && geometry.colors && geometry.colors.length > 0;
    if (hasColors) {
        colorBuffer = createArrayBuffer(gl, 'color', geometry);
    }

    return {
        vertexArray: vao,
        positionBuffer,
        uvBuffer,
        normalBuffer,
        colorBuffer,
    };
};

const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
};

const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return undefined;
};

const createTexture = (gl, image) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    return texture;
};

const createUniformTypeLookupTable = (gl) => ({
    [gl.FLOAT_MAT4]: 'mat4',
    [gl.FLOAT_MAT3]: 'mat3',
    [gl.FLOAT_VEC2]: 'vec2',
    [gl.FLOAT_VEC3]: 'vec3',
    [gl.FLOAT_VEC4]: 'vec4',
    [gl.FLOAT]: 'float',
    [gl.INT]: 'int',
    [gl.SAMPLER_2D]: 'sampler2D',
});

const uniformTypeToUpdateUniformFunction = {
    mat4: (gl, location, value) => gl.uniformMatrix4fv(location, false, value),
    mat3: (gl, location, value) => gl.uniformMatrix3fv(location, false, value),
    vec3: (gl, location, value) => gl.uniform3fv(location, value),
    vec4: (gl, location, value) => gl.uniform4fv(location, value),
    float: (gl, location, value) => Array.isArray(value) ? gl.uniform1fv(location, value) : gl.uniform1f(location, value),
    int: (gl, location, value) => Array.isArray(value) ? gl.uniform1iv(location, value) : gl.uniform1i(location, value),
    sampler2D: (gl, location, index) => gl.uniform1i(location, index),
};

const WebGL2Utils = {
    createArrayBuffer,
    createElementArrayBuffer,
    createVertexArray,
    createShader,
    createProgram,
    createUniformTypeLookupTable,
    uniformTypeToUpdateUniformFunction,
    createTexture,
};

export default WebGL2Utils;
