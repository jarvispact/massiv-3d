/* eslint-disable no-console, no-bitwise */

import MathUtils from './math-utils';

const arrayBufferLookupTable = {
    position: (geometry, shaderLocations) => ({
        location: shaderLocations.position,
        bufferData: geometry.getPositionBuffer(),
        bufferSize: geometry.getPositionBufferSize(),
    }),
    normal: (geometry, shaderLocations) => ({
        location: shaderLocations.normal,
        bufferData: geometry.getNormalBuffer(),
        bufferSize: geometry.getNormalBufferSize(),
    }),
    uv: (geometry, shaderLocations) => ({
        location: shaderLocations.uv,
        bufferData: geometry.getUvBuffer(),
        bufferSize: geometry.getUvBufferSize(),
    }),
    color: (geometry, shaderLocations) => ({
        location: shaderLocations.color,
        bufferData: geometry.getColorBuffer(),
        bufferSize: geometry.getColorBufferSize(),
    }),
};

const cache = { meshes: {} };

const WebGLRenderer = class {
    constructor({ domNode, scene, options = {} } = {}) {
        this.domNode = domNode;
        this.scene = scene;

        this.shaderLocations = options.shaderLocations || {
            position: 0,
            normal: 1,
            uv: 2,
            color: 3,
        };

        this.depthFunc = options.depthFunc || 'LEQUAL';
        this.enableDepthTest = options.enableDepthTest || true;

        this.createAndAppendCanvas();
        this.gl = this.canvas.getContext('webgl2');

        this.setClearColor();
        this.setViewPort();
        this.setDepthFunc(this.depthFunc);
        if (this.enableDepthTest) this.gl.enable(this.gl.DEPTH_TEST);
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
        this.setViewPort();
    }

    setClearColor(r = 0, g = 0, b = 0, a = 1) {
        this.gl.clearColor(r, g, b, a);
    }

    setViewPort() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    setDepthFunc(func) {
        this.gl.depthFunc(this.gl[func]);
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

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        return texture;
    }

    createArrayBuffer(type, geometry) {
        const { gl, shaderLocations } = this;
        const { location, bufferData, bufferSize } = arrayBufferLookupTable[type](geometry, shaderLocations);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, bufferSize, gl.FLOAT, false, 0, 0);
    }

    createVertexArray(geometry) {
        const { gl } = this;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const hasPositions = geometry.positions.length > 0;
        if (hasPositions) this.createArrayBuffer('position', geometry);

        const hasNormals = geometry.normals.length > 0;
        if (hasNormals) this.createArrayBuffer('normal', geometry);

        const hasUvs = geometry.uvs.length > 0;
        if (hasUvs) this.createArrayBuffer('uv', geometry);

        const hasColors = geometry.colors.length > 0;
        if (hasColors) this.createArrayBuffer('color', geometry);

        return vao;
    }

    createElementArrayBuffer(material) {
        const { gl } = this;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, material.getIndexBuffer(), gl.STATIC_DRAW);
        return buffer;
    }

    cacheMesh(mesh, directionalLights, camera) {
        console.log('cache mesh called', mesh.id);
        const { gl, shaderLocations } = this;
        const { id, modelMatrix, geometry, materials } = mesh;

        cache.meshes[id] = {
            vao: this.createVertexArray(geometry),
            modelMatrix,
            materials: [],
        };

        for (let materialIdx = 0; materialIdx < materials.length; materialIdx++) {
            const material = materials[materialIdx];

            const elementIndexBuffer = this.createElementArrayBuffer(material);
            const indicesLength = material.getIndexBufferLength();

            const { vertexShaderSource, fragmentShaderSource, uniforms: materialUniforms, textures: materialTextures } = material.getShaderSource({ shaderLocations, directionalLights, camera });
            const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
            const shader = this.createProgram(vertexShader, fragmentShader);

            const flatUniforms = { ...materialUniforms.vertexShader, ...materialUniforms.fragmentShader };

            const uniforms = Object.keys(flatUniforms).filter(key => flatUniforms[key]).reduce((accum, key) => {
                accum[key] = gl.getUniformLocation(shader, key);
                return accum;
            }, {});

            const textures = Object.keys(materialTextures).filter(key => materialTextures[key]).reduce((accum, key) => {
                accum[key] = this.createTexture(materialTextures[key]);
                return accum;
            }, {});

            cache.meshes[id].materials.push({
                elementIndexBuffer,
                indicesLength,
                shader,
                material,
                uniforms,
                textures,
            });
        }
    }

    render() {
        const { gl } = this;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO only compute modelMatrix for meshes
        this.scene.computeModelMatrix();
        const { activeCamera, meshes, directionalLights } = this.scene.getChildren({ recursive: true });

        for (let meshIdx = 0; meshIdx < meshes.length; meshIdx++) {
            const mesh = meshes[meshIdx];
            if (!cache.meshes[mesh.id]) this.cacheMesh(mesh, directionalLights, activeCamera);
        }

        const meshCache = Object.values(cache.meshes);

        for (let meshIdx = 0; meshIdx < meshCache.length; meshIdx++) {
            const cachedMesh = meshCache[meshIdx];
            gl.bindVertexArray(cachedMesh.vao);

            const mv = MathUtils.multiplyMat4(MathUtils.createMat4(), activeCamera.viewMatrix, cachedMesh.modelMatrix);
            // const modelViewProjectionMatrix = MathUtils.multiplyMat4(MathUtils.createMat4(), activeCamera.projectionMatrix, mv);
            const normalMatrix = MathUtils.normalMatFromMat4(MathUtils.createMat3(), mv);

            for (let materialIdx = 0; materialIdx < cachedMesh.materials.length; materialIdx++) {
                const material = cachedMesh.materials[materialIdx];
                gl.useProgram(material.shader);

                // TODO cache uniforms
                // and make uniform and texture handling more generic
                const uniformKeys = Object.keys(material.uniforms);
                const textureKeys = Object.keys(material.textures);

                if (uniformKeys.includes('color')) gl.uniform3fv(material.uniforms.color, material.material.color);
                if (uniformKeys.includes('modelMatrix')) gl.uniformMatrix4fv(material.uniforms.modelMatrix, false, cachedMesh.modelMatrix);
                if (uniformKeys.includes('viewMatrix')) gl.uniformMatrix4fv(material.uniforms.viewMatrix, false, activeCamera.viewMatrix);
                if (uniformKeys.includes('projectionMatrix')) gl.uniformMatrix4fv(material.uniforms.projectionMatrix, false, activeCamera.projectionMatrix);
                if (uniformKeys.includes('normalMatrix')) gl.uniformMatrix3fv(material.uniforms.normalMatrix, false, normalMatrix);
                if (uniformKeys.includes('cameraPosition')) gl.uniform3fv(material.uniforms.cameraPosition, activeCamera.position);
                if (uniformKeys.includes('lightDirection')) gl.uniform3fv(material.uniforms.lightDirection, directionalLights[0].direction);

                if (uniformKeys.includes('diffuseMap') && textureKeys.includes('diffuseMap')) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, material.textures.diffuseMap);
                    gl.uniform1i(material.uniforms.diffuseMap, 0);
                }

                if (uniformKeys.includes('specularMap') && textureKeys.includes('specularMap')) {
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, material.textures.specularMap);
                    gl.uniform1i(material.uniforms.specularMap, 1);
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, material.elementIndexBuffer);
                gl.drawElements(gl.TRIANGLES, material.indicesLength, gl.UNSIGNED_INT, 0);
            }
        }
    }
};

export default WebGLRenderer;
