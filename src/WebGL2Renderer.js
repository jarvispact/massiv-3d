import { mat3, mat4 } from 'gl-matrix';
import { getVertexColorShaderSource, getBlinnPhongShaderSource } from '../utils/shader-utils';
import VertexColorMaterial from './VertexColorMaterial';
import BlinnPhongMaterial from './BlinnPhongMaterial';

const WebGL2Renderer = class {
    constructor(domNode, scene, camera) {
        this.domNode = domNode;
        this.scene = scene;
        this.camera = camera;
        this.createAndAppendCanvas();
        this.gl = this.canvas.getContext('webgl2');
    }

    createAndAppendCanvas() {
        this.canvas = document.createElement('canvas'); // eslint-disable-line
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
        console.error(gl.getShaderInfoLog(shader)); // eslint-disable-line
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
        console.error(gl.getProgramInfoLog(program)); // eslint-disable-line
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
            [WebGL2Renderer.BUFFER_TYPE_POSITION]: g => ({
                loc: WebGL2Renderer.SHADER_POSITION_LOCATION,
                bufferData: g.getPositionsBuffer(),
                bufferSize: g.getPositionsBufferSize(),
            }),
            [WebGL2Renderer.BUFFER_TYPE_NORMAL]: g => ({
                loc: WebGL2Renderer.SHADER_NORMAL_LOCATION,
                bufferData: g.getNormalsBuffer(),
                bufferSize: g.getNormalsBufferSize(),
            }),
            [WebGL2Renderer.BUFFER_TYPE_UV]: g => ({
                loc: WebGL2Renderer.SHADER_UV_LOCATION,
                bufferData: g.getUvsBuffer(),
                bufferSize: g.getUvsBufferSize(),
            }),
            [WebGL2Renderer.BUFFER_TYPE_VERTEXCOLOR]: g => ({
                loc: WebGL2Renderer.SHADER_VERTEXCOLOR_LOCATION,
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
        if (hasPositions) this.createArrayBuffer(WebGL2Renderer.BUFFER_TYPE_POSITION, geometry);

        const hasNormals = geometry.normals.length > 0;
        if (hasNormals) this.createArrayBuffer(WebGL2Renderer.BUFFER_TYPE_NORMAL, geometry);

        const hasUvs = geometry.uvs.length > 0;
        if (hasUvs) this.createArrayBuffer(WebGL2Renderer.BUFFER_TYPE_UV, geometry);

        const hasVertexColors = geometry.vertexColors.length > 0;
        if (hasVertexColors) this.createArrayBuffer(WebGL2Renderer.BUFFER_TYPE_VERTEXCOLOR, geometry);

        return vao;
    }

    createElementArrayBuffer(material) {
        const { gl } = this;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, material.getIndicesBuffer(), gl.STATIC_DRAW);
        return buffer;
    }

    static getShaderSourceForMaterial(args) {
        const floatPrecision = WebGL2Renderer.SHADER_FLOAT_PRECISION_DEFAULT;
        const intPrecision = WebGL2Renderer.SHADER_INT_PRECISION_DEFAULT;
        const positionLocation = WebGL2Renderer.SHADER_POSITION_LOCATION;
        const normalLocation = WebGL2Renderer.SHADER_NORMAL_LOCATION;
        const uvLocation = WebGL2Renderer.SHADER_UV_LOCATION;
        const vertexColorLocation = WebGL2Renderer.SHADER_VERTEXCOLOR_LOCATION;

        const {
            material,
            hasPositions,
            hasNormals,
            hasUvs,
            hasVertexColors,
        } = args;

        const sharedArgs = {
            floatPrecision,
            intPrecision,
            positionLocation,
            normalLocation,
            uvLocation,
            vertexColorLocation,
            hasPositions,
            hasNormals,
            hasUvs,
            hasVertexColors,
        };

        const uniforms = {
            vertexShader: {
                modelMatrix: 'mat4',
                viewMatrix: 'mat4',
                projectionMatrix: 'mat4',
                normalMatrix: 'mat3',
                mvp: 'mat4',
            },
            fragmentShader: {},
        };

        if (material.diffuseTexture) {
            uniforms.fragmentShader.diffuseTexture = 'sampler2D';
        }

        if (material instanceof VertexColorMaterial) {
            return getVertexColorShaderSource({ ...sharedArgs, uniforms });
        }

        if (material instanceof BlinnPhongMaterial) {
            return getBlinnPhongShaderSource({ ...sharedArgs, uniforms });
        }

        throw new Error('Cannot render Material');
    }

    init() {
        const { gl } = this;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        this.sceneChildren = this.scene.getChildren({ recursive: true });
        // all the following logic should only apply to children of class 'Mesh'
        // in fact group all of it in a update function to be able to react on scene updates
        // e.g. when objects are added to / removed from the scene
        this.shaders = [];
        this.vaos = [];
        this.indicesBuffers = [];
        this.uniforms = [];
        this.textures = [];

        for (let childIndex = 0; childIndex < this.sceneChildren.length; childIndex++) {
            const child = this.sceneChildren[childIndex];

            this.shaders[childIndex] = [];
            this.uniforms[childIndex] = [];
            this.indicesBuffers[childIndex] = [];
            this.textures[childIndex] = [];

            this.vaos[childIndex] = this.createVertexArray(child.geometry);

            for (let materialIndex = 0; materialIndex < child.materials.length; materialIndex++) {
                const material = child.materials[materialIndex];

                this.indicesBuffers[childIndex][materialIndex] = this.createElementArrayBuffer(material);

                const shaderSourceArgs = {
                    material,
                };

                const { vertexShaderSource, fragmentShaderSource } = WebGL2Renderer.getShaderSourceForMaterial(shaderSourceArgs);
                const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
                const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
                this.shaders[childIndex][materialIndex] = this.createProgram(vertexShader, fragmentShader);

                this.uniforms[childIndex][materialIndex] = {
                    modelMatrix: gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'modelMatrix'),
                    viewMatrix: gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'viewMatrix'),
                    projectionMatrix: gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'projectionMatrix'),
                    normalMatrix: gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'normalMatrix'),
                    mvp: gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'mvp'),
                    // diffuseTexture: gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'diffuseTexture'),
                };

                const hasDiffuseTexture = !!material.diffuseTexture;
                if (hasDiffuseTexture) {
                    this.textures[childIndex][materialIndex] = this.createTexture(material.diffuseTexture);
                    this.uniforms[childIndex][materialIndex].diffuseTexture = gl.getUniformLocation(this.shaders[childIndex][materialIndex], 'diffuseTexture');
                }
            }
        }
    }

    render() {
        const { gl } = this;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // eslint-disable-line

        this.scene.computeModelMatrix();

        for (let childIndex = 0; childIndex < this.sceneChildren.length; childIndex++) {
            const child = this.sceneChildren[childIndex];

            const mv = mat4.multiply(mat4.create(), this.camera.viewMatrix, child.modelMatrix);
            const mvp = mat4.multiply(mat4.create(), this.camera.projectionMatrix, mv);
            const normalMatrix = mat3.normalFromMat4(mat3.create(), mv);

            gl.bindVertexArray(this.vaos[childIndex]);

            let materialIndex = 0;
            const materialMax = child.materials.length;
            for (; materialIndex < materialMax; materialIndex++) {
                const material = child.materials[materialIndex];

                gl.useProgram(this.shaders[childIndex][materialIndex]);
                gl.uniformMatrix4fv(this.uniforms[childIndex][materialIndex].modelMatrix, false, child.modelMatrix);
                gl.uniformMatrix4fv(this.uniforms[childIndex][materialIndex].viewMatrix, false, this.camera.viewMatrix);
                gl.uniformMatrix4fv(this.uniforms[childIndex][materialIndex].projectionMatrix, false, this.camera.projectionMatrix);
                gl.uniformMatrix3fv(this.uniforms[childIndex][materialIndex].normalMatrix, false, normalMatrix);
                gl.uniformMatrix4fv(this.uniforms[childIndex][materialIndex].mvp, false, mvp);

                const hasDiffuseTexture = !!material.diffuseTexture;
                if (hasDiffuseTexture) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, this.textures[childIndex][materialIndex]);
                    gl.uniform1i(this.uniforms[childIndex][materialIndex].diffuseTexture, 0);
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffers[childIndex][materialIndex]);
                gl.drawElements(gl.TRIANGLES, material.getIndicesLength(), gl.UNSIGNED_INT, 0);
            }
        }
    }
};

WebGL2Renderer.SHADER_POSITION_LOCATION = 0;
WebGL2Renderer.SHADER_NORMAL_LOCATION = 1;
WebGL2Renderer.SHADER_UV_LOCATION = 2;
WebGL2Renderer.SHADER_VERTEXCOLOR_LOCATION = 3;
WebGL2Renderer.BUFFER_TYPE_POSITION = 'position';
WebGL2Renderer.BUFFER_TYPE_NORMAL = 'normal';
WebGL2Renderer.BUFFER_TYPE_UV = 'uv';
WebGL2Renderer.BUFFER_TYPE_VERTEXCOLOR = 'vertexColor';
WebGL2Renderer.SHADER_PRECISION_HIGH = 'highp';
WebGL2Renderer.SHADER_PRECISION_MEDIUM = 'mediump';
WebGL2Renderer.SHADER_PRECISION_LOW = 'lowp';
WebGL2Renderer.SHADER_FLOAT_PRECISION_DEFAULT = WebGL2Renderer.SHADER_PRECISION_MEDIUM;
WebGL2Renderer.SHADER_INT_PRECISION_DEFAULT = WebGL2Renderer.SHADER_PRECISION_MEDIUM;

export default WebGL2Renderer;
