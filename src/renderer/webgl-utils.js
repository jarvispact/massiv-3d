/* eslint-disable no-console */

const SHADER_LAYOUT_LOCATIONS = {
    VERTEX: 0,
    NORMAL: 1,
    UV: 2,
    VERTEX_COLOR: 3,
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

const arrayBufferLookupTable = {
    vertex: (geometry) => ({
        location: SHADER_LAYOUT_LOCATIONS.VERTEX,
        bufferData: Float32Array.from(geometry.vertices),
        bufferSize: 3,
    }),
    normal: (geometry) => ({
        location: SHADER_LAYOUT_LOCATIONS.NORMAL,
        bufferData: Float32Array.from(geometry.normals),
        bufferSize: 3,
    }),
    uv: (geometry) => ({
        location: SHADER_LAYOUT_LOCATIONS.UV,
        bufferData: Float32Array.from(geometry.uvs),
        bufferSize: 2,
    }),
    vertexColor: (geometry) => ({
        location: SHADER_LAYOUT_LOCATIONS.VERTEX_COLOR,
        bufferData: Float32Array.from(geometry.vertexColors),
        bufferSize: 4,
    }),
};

const createArrayBuffer = (gl, type, geometry) => {
    const result = arrayBufferLookupTable[type](geometry);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, result.bufferData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(result.location);
    gl.vertexAttribPointer(result.location, result.bufferSize, gl.FLOAT, false, 0, 0);
};

const createElementArrayBuffer = (gl, material) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint32Array.from(material.indices), gl.STATIC_DRAW);
    return buffer;
};

const createVertexArray = (gl, geometry) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const hasPositions = geometry.vertices.length > 0;
    if (hasPositions) createArrayBuffer(gl, 'vertex', geometry);

    const hasNormals = geometry.normals.length > 0;
    if (hasNormals) createArrayBuffer(gl, 'normal', geometry);

    const hasUvs = geometry.uvs.length > 0;
    if (hasUvs) createArrayBuffer(gl, 'uv', geometry);

    const hasColors = geometry.vertexColors.length > 0;
    if (hasColors) createArrayBuffer(gl, 'vertexColor', geometry);

    return vao;
};

const createUniformTypeLookupTable = (gl) => ({
    [gl.FLOAT_MAT4]: 'mat4',
    [gl.FLOAT_MAT3]: 'mat3',
    [gl.FLOAT_VEC3]: 'vec3',
    [gl.FLOAT]: 'float',
    [gl.INT]: 'int',
    [gl.SAMPLER_2D]: 'sampler2D',
});

const uniformTypeToUpdateUniformFunction = {
    mat4: (gl, location, value) => gl.uniformMatrix4fv(location, false, value),
    mat3: (gl, location, value) => gl.uniformMatrix3fv(location, false, value),
    vec3: (gl, location, value) => gl.uniform3fv(location, value),
    float: (gl, location, value) => gl.uniform1f(location, value),
    int: (gl, location, value) => gl.uniform1i(location, value),
    sampler2D: (gl, location, index) => gl.uniform1i(location, index),
};

const WebGLUtils = {
    SHADER_LAYOUT_LOCATIONS,
    createShader,
    createProgram,
    createTexture,
    createArrayBuffer,
    createElementArrayBuffer,
    createVertexArray,
    createUniformTypeLookupTable,
    uniformTypeToUpdateUniformFunction,
};

export default WebGLUtils;
