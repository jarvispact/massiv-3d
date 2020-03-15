/* eslint-disable no-console, no-confusing-arrow, max-len */

const CONSTANT = {
    MAX_DIRECTIONAL_LIGHTS: { TYPE: 'int', NAME: 'MAX_DIRECTIONAL_LIGHTS', VALUE: '5' },
};

const ATTRIBUTE = {
    POSITION: { LOCATION: 0, TYPE: 'vec3', NAME: 'position' },
    UV: { LOCATION: 1, TYPE: 'vec2', NAME: 'uv' },
    NORMAL: { LOCATION: 2, TYPE: 'vec3', NAME: 'normal' },
    COLOR: { LOCATION: 3, TYPE: 'vec3', NAME: 'color' },
};

const VARYING = {
    POSITION: { TYPE: 'vec3', NAME: 'vPosition' },
    UV: { TYPE: 'vec2', NAME: 'vUv' },
    NORMAL: { TYPE: 'vec3', NAME: 'vNormal' },
};

const UNIFORM = {
    MODEL_MATRIX: { TYPE: 'mat4', NAME: 'modelMatrix' },
    MODEL_VIEW_MATRIX: { TYPE: 'mat4', NAME: 'modelViewMatrix' },
    NORMAL_MATRIX: { TYPE: 'mat3', NAME: 'normalMatrix' },

    DIFFUSE_COLOR: { TYPE: 'vec3', NAME: 'diffuseColor' },
    SPECULAR_COLOR: { TYPE: 'vec3', NAME: 'specularColor' },
    AMBIENT_INTENSITY: { TYPE: 'float', NAME: 'ambientIntensity' },
    SPECULAR_SHININESS: { TYPE: 'float', NAME: 'specularShininess' },
    OPACITY: { TYPE: 'float', NAME: 'opacity' },

    DIFFUSE_MAP: { TYPE: 'sampler2D', NAME: 'diffuseMap' },
    SPECULAR_MAP: { TYPE: 'sampler2D', NAME: 'specularMap' },

    PROJECTION_MATRIX: { TYPE: 'mat4', NAME: 'projectionMatrix' },
    CAMERA_POSITION: { TYPE: 'vec3', NAME: 'cameraPosition' },

    DIR_LIGHT_DIRECTIONS: { TYPE: 'vec3', NAME: 'dirLightDirection[0]', NAME_WITH_INDEX: 'dirLightDirection[i]', DECLARATION: `dirLightDirection[${CONSTANT.MAX_DIRECTIONAL_LIGHTS.NAME}]` },
    DIR_LIGHT_AMBIENT_COLORS: { TYPE: 'vec3', NAME: 'dirLightAmbientColor[0]', NAME_WITH_INDEX: 'dirLightAmbientColor[i]', DECLARATION: `dirLightAmbientColor[${CONSTANT.MAX_DIRECTIONAL_LIGHTS.NAME}]` },
    DIR_LIGHT_DIFFUSE_COLORS: { TYPE: 'vec3', NAME: 'dirLightDiffuseColor[0]', NAME_WITH_INDEX: 'dirLightDiffuseColor[i]', DECLARATION: `dirLightDiffuseColor[${CONSTANT.MAX_DIRECTIONAL_LIGHTS.NAME}]` },
    DIR_LIGHT_SPECULAR_COLORS: { TYPE: 'vec3', NAME: 'dirLightSpecularColor[0]', NAME_WITH_INDEX: 'dirLightSpecularColor[i]', DECLARATION: `dirLightSpecularColor[${CONSTANT.MAX_DIRECTIONAL_LIGHTS.NAME}]` },
    DIR_LIGHT_INTENSITIES: { TYPE: 'float', NAME: 'dirLightIntensity[0]', NAME_WITH_INDEX: 'dirLightIntensity[i]', DECLARATION: `dirLightIntensity[${CONSTANT.MAX_DIRECTIONAL_LIGHTS.NAME}]` },
    DIR_LIGHT_COUNT: { TYPE: 'int', NAME: 'dirLightCount' },
};

const arrayBufferLookupTable = {
    [ATTRIBUTE.POSITION.NAME]: (geometry) => ({
        location: ATTRIBUTE.POSITION.LOCATION,
        bufferData: geometry.positions,
        bufferSize: geometry.positionBufferSize,
    }),
    [ATTRIBUTE.UV.NAME]: (geometry) => ({
        location: ATTRIBUTE.UV.LOCATION,
        bufferData: geometry.uvs,
        bufferSize: geometry.uvBufferSize,
    }),
    [ATTRIBUTE.NORMAL.NAME]: (geometry) => ({
        location: ATTRIBUTE.NORMAL.LOCATION,
        bufferData: geometry.normals,
        bufferSize: geometry.normalBufferSize,
    }),
    [ATTRIBUTE.COLOR.NAME]: (geometry) => ({
        location: ATTRIBUTE.COLOR.LOCATION,
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

    const hasPositions = attribs.includes(ATTRIBUTE.POSITION.NAME) && geometry.positions.length > 0;
    if (hasPositions) positionBuffer = createArrayBuffer(gl, ATTRIBUTE.POSITION.NAME, geometry);

    const hasUvs = attribs.includes(ATTRIBUTE.UV.NAME) && geometry.uvs.length > 0;
    if (hasUvs) uvBuffer = createArrayBuffer(gl, ATTRIBUTE.UV.NAME, geometry);

    const hasNormals = attribs.includes(ATTRIBUTE.NORMAL.NAME) && geometry.normals.length > 0;
    if (hasNormals) normalBuffer = createArrayBuffer(gl, ATTRIBUTE.NORMAL.NAME, geometry);

    const hasColors = attribs.includes(ATTRIBUTE.COLOR.NAME) && geometry.colors.length > 0;
    if (hasColors) colorBuffer = createArrayBuffer(gl, ATTRIBUTE.COLOR.NAME, geometry);

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
    CONSTANT,
    ATTRIBUTE,
    VARYING,
    UNIFORM,
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
