/* eslint-disable no-console, no-bitwise */
import MathUtils from './math-utils';

const WebGLRenderer = class {
    constructor(domNode, scene, camera) {
        this.domNode = domNode;
        this.scene = scene;
        this.camera = camera;
        this.createAndAppendCanvas();
        this.gl = this.canvas.getContext('webgl2');
    }

    createAndAppendCanvas() {
        this.canvas = document.createElement('canvas');
        this.domNode.appendChild(this.canvas);
        this.canvas.style.position = 'relative';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.domNode.clientWidth;
        this.canvas.height = this.domNode.clientHeight;
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    createShader(type, source) {
        const { gl } = this;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) return shader;
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return undefined;
    }

    createProgram(vertexShader, fragmentShader) {
        const { gl } = this;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) return program;
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return undefined;
    }

    createTexture(image) {
        const { gl } = this;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        return texture;
    }

    createArrayBuffer(type, geometry) {
        const { gl } = this;

        const lookupTable = {
            [WebGLRenderer.BUFFER_TYPE_POSITION]: g => ({
                loc: WebGLRenderer.SHADER_POSITION_LOCATION,
                bufferData: g.getPositionsBuffer(),
                bufferSize: g.getPositionsBufferSize(),
            }),
            [WebGLRenderer.BUFFER_TYPE_NORMAL]: g => ({
                loc: WebGLRenderer.SHADER_NORMAL_LOCATION,
                bufferData: g.getNormalsBuffer(),
                bufferSize: g.getNormalsBufferSize(),
            }),
            [WebGLRenderer.BUFFER_TYPE_UV]: g => ({
                loc: WebGLRenderer.SHADER_UV_LOCATION,
                bufferData: g.getUvsBuffer(),
                bufferSize: g.getUvsBufferSize(),
            }),
            [WebGLRenderer.BUFFER_TYPE_VERTEXCOLOR]: g => ({
                loc: WebGLRenderer.SHADER_VERTEXCOLOR_LOCATION,
                bufferData: g.getVertexColorsBuffer(),
                bufferSize: g.getVertexColorsBufferSize(),
            }),
        };

        const { loc, bufferData, bufferSize } = lookupTable[type](geometry);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, bufferSize, gl.FLOAT, false, 0, 0);
    }

    createVertexArray(geometry) {
        const { gl } = this;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const hasPositions = geometry.positions.length > 0;
        if (hasPositions) this.createArrayBuffer(WebGLRenderer.BUFFER_TYPE_POSITION, geometry);

        const hasNormals = geometry.normals.length > 0;
        if (hasNormals) this.createArrayBuffer(WebGLRenderer.BUFFER_TYPE_NORMAL, geometry);

        const hasUvs = geometry.uvs.length > 0;
        if (hasUvs) this.createArrayBuffer(WebGLRenderer.BUFFER_TYPE_UV, geometry);

        const hasVertexColors = geometry.vertexColors.length > 0;
        if (hasVertexColors) this.createArrayBuffer(WebGLRenderer.BUFFER_TYPE_VERTEXCOLOR, geometry);

        return vao;
    }

    createElementArrayBuffer(material) {
        const { gl } = this;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, material.getIndicesBuffer(), gl.STATIC_DRAW);
        return buffer;
    }

    init() {
        const { gl } = this;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        const { meshes } = this.scene.getChildren({ recursive: true });
        this.meshBuffers = [];

        for (let meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
            const mesh = meshes[meshIndex];
            const { geometry, materials } = mesh;
            const material = materials[0];

            this.meshBuffers[meshIndex] = {
                modelMatrix: mesh.modelMatrix,
                indicesLength: material.getIndicesLength(),
                material,
            };

            this.meshBuffers[meshIndex].vao = this.createVertexArray(geometry);
            this.meshBuffers[meshIndex].elementIndexBuffer = this.createElementArrayBuffer(material);

            const { vertexShaderSource, fragmentShaderSource, uniforms, textures } = material.getShaderSource();
            const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
            this.meshBuffers[meshIndex].shader = this.createProgram(vertexShader, fragmentShader);

            const flatUniforms = { ...uniforms.vertexShader, ...uniforms.fragmentShader };

            this.meshBuffers[meshIndex].uniforms = Object.keys(flatUniforms).filter(key => flatUniforms[key]).reduce((accum, key) => {
                accum[key] = gl.getUniformLocation(this.meshBuffers[meshIndex].shader, key);
                return accum;
            }, {});

            this.meshBuffers[meshIndex].textures = Object.keys(textures).reduce((accum, key) => {
                accum[key] = this.createTexture(textures[key]);
                return accum;
            }, {});
        }
    }

    render() {
        const { gl } = this;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.scene.computeModelMatrix();

        for (let meshIndex = 0; meshIndex < this.meshBuffers.length; meshIndex++) {
            const meshBuffer = this.meshBuffers[meshIndex];
            gl.bindVertexArray(meshBuffer.vao);
            gl.useProgram(meshBuffer.shader);

            const uniformKeys = Object.keys(meshBuffer.uniforms);
            const textureKeys = Object.keys(meshBuffer.textures);

            const mv = MathUtils.multiplyMat4(MathUtils.createMat4(), this.camera.viewMatrix, meshBuffer.modelMatrix);
            const modelViewProjectionMatrix = MathUtils.multiplyMat4(MathUtils.createMat4(), this.camera.projectionMatrix, mv);
            const normalMatrix = MathUtils.normalMatFromMat4(MathUtils.createMat3(), mv);

            if (uniformKeys.includes('modelMatrix')) gl.uniformMatrix4fv(meshBuffer.uniforms.modelMatrix, false, meshBuffer.modelMatrix);
            if (uniformKeys.includes('viewMatrix')) gl.uniformMatrix4fv(meshBuffer.uniforms.viewMatrix, false, this.camera.viewMatrix);
            if (uniformKeys.includes('projectionMatrix')) gl.uniformMatrix4fv(meshBuffer.uniforms.projectionMatrix, false, this.camera.projectionMatrix);
            if (uniformKeys.includes('normalMatrix')) gl.uniformMatrix3fv(meshBuffer.uniforms.normalMatrix, false, normalMatrix);
            if (uniformKeys.includes('modelViewProjectionMatrix')) gl.uniformMatrix4fv(meshBuffer.uniforms.modelViewProjectionMatrix, false, modelViewProjectionMatrix);

            if (uniformKeys.includes('diffuseTexture') && textureKeys.includes('diffuseTexture')) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, meshBuffer.textures.diffuseTexture);
                gl.uniform1i(meshBuffer.uniforms.diffuseTexture, 0);
            }

            if (uniformKeys.includes('cameraPosition')) gl.uniform3fv(meshBuffer.uniforms.cameraPosition, this.camera.position);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshBuffer.elementIndexBuffer);
            gl.drawElements(gl.TRIANGLES, meshBuffer.indicesLength, gl.UNSIGNED_INT, 0);
        }
    }
};

WebGLRenderer.SHADER_POSITION_LOCATION = 0;
WebGLRenderer.SHADER_NORMAL_LOCATION = 1;
WebGLRenderer.SHADER_UV_LOCATION = 2;
WebGLRenderer.SHADER_VERTEXCOLOR_LOCATION = 3;
WebGLRenderer.BUFFER_TYPE_POSITION = 'position';
WebGLRenderer.BUFFER_TYPE_NORMAL = 'normal';
WebGLRenderer.BUFFER_TYPE_UV = 'uv';
WebGLRenderer.BUFFER_TYPE_VERTEXCOLOR = 'vertexColor';
WebGLRenderer.SHADER_PRECISION_HIGH = 'highp';
WebGLRenderer.SHADER_PRECISION_MEDIUM = 'mediump';
WebGLRenderer.SHADER_PRECISION_LOW = 'lowp';
WebGLRenderer.SHADER_FLOAT_PRECISION = WebGLRenderer.SHADER_PRECISION_MEDIUM;
WebGLRenderer.SHADER_INT_PRECISION = WebGLRenderer.SHADER_PRECISION_MEDIUM;

export default WebGLRenderer;
