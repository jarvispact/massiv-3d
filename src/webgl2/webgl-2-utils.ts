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