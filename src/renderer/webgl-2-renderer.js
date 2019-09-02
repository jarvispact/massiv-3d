
const arrayBufferLookupTable = {
    vertex: (geometry, shaderLoc) => ({
        location: shaderLoc.vertex,
        bufferData: geometry.getVerticesAsFloat32Array(),
        bufferSize: geometry.getVertexVectorSize(),
    }),
    normal: (geometry, shaderLoc) => ({
        location: shaderLoc.normal,
        bufferData: geometry.getNormalsAsFloat32Array(),
        bufferSize: geometry.getNormalVectorSize(),
    }),
    uv: (geometry, shaderLoc) => ({
        location: shaderLoc.uv,
        bufferData: geometry.getUvsAsFloat32Array(),
        bufferSize: geometry.getUvVectorSize(),
    }),
    vertexColor: (geometry, shaderLoc) => ({
        location: shaderLoc.vertexColor,
        bufferData: geometry.getVertexColorsAsFloat32Array(),
        bufferSize: geometry.getVertexColorVectorSize(),
    }),
};

class WebGl2Renderer {
    constructor(domNode) {
        this.domNode = domNode;
        this.canvas = document.createElement('canvas');
        this.domNode.appendChild(this.canvas);
        this.canvas.style.position = 'relative';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.domNode.clientWidth;
        this.canvas.height = this.domNode.clientHeight;
        this.gl = this.canvas.getContext('webgl2');

        this.shaderLayoutLocations = {
            vertex: 0,
            normal: 1,
            uv: 2,
            vertexColor: 3,
        };

        this.sceneCache = {};
        this.meshCache = {};
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
        const { gl } = this;
        const { location, bufferData, bufferSize } = arrayBufferLookupTable[type](geometry, this.shaderLayoutLocations);        
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

        const hasPositions = geometry.getVertices().length > 0;
        if (hasPositions) this.createArrayBuffer('vertex', geometry);

        const hasNormals = geometry.getNormals().length > 0;
        if (hasNormals) this.createArrayBuffer('normal', geometry);

        const hasUvs = geometry.getUvs().length > 0;
        if (hasUvs) this.createArrayBuffer('uv', geometry);

        const hasColors = geometry.getVertexColors().length > 0;
        if (hasColors) this.createArrayBuffer('vertexColor', geometry);

        return vao;
    }

    createElementArrayBuffer(material) {
        const { gl } = this;
        const buffer = this.gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, material.getIndicesAsUint32Array(), gl.STATIC_DRAW);
        return buffer;
    }

    resize() {
        const { gl, canvas, domNode } = this;
        const w = domNode.clientWidth;
        const h = domNode.clientHeight;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    cacheMesh(mesh) {
        const { gl } = this;

        const materialArgs = {
            shaderLayoutLocations: this.shaderLayoutLocations,
        };

        const shaderData = mesh.material.getShaderData(materialArgs);
        const vertexShader = this.createShader(gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        const shader = this.createProgram(vertexShader, fragmentShader);

        const flatUniforms = { ...shaderData.uniforms.vertexShader, ...shaderData.uniforms.fragmentShader };
        const uniforms = Object.keys(flatUniforms).filter(key => flatUniforms[key]).reduce((accum, key) => {
            accum[key] = gl.getUniformLocation(shader, key);
            return accum;
        }, {});

        const cachedMesh = {
            vao: this.createVertexArray(mesh.geometry),
            indices: this.createElementArrayBuffer(mesh.material),
            shader,
            uniforms,
        };

        this.meshCache[mesh.id] = cachedMesh;
        return cachedMesh;
    }

    render(scene) {
        const { gl } = this;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        scene.computeModelMatrix();
        const { activeCamera, meshes } = scene.getChildrenRecursive();

        for (let i = 0; i < meshes.length; i++) {
            const currentMesh = meshes[i];
            const cachedMesh = this.meshCache[currentMesh.id] || this.cacheMesh(currentMesh);

            const mv = activeCamera.viewMatrix.clone().multiply(currentMesh.modelMatrix);
            const mvp = activeCamera.projectionMatrix.clone().multiply(mv);
            const uniformKeys = Object.keys(cachedMesh.uniforms);

            gl.bindVertexArray(cachedMesh.vao);
            gl.useProgram(cachedMesh.shader);
            if (uniformKeys.includes('mvp')) gl.uniformMatrix4fv(cachedMesh.uniforms.mvp, false, mvp.getAsFloat32Array());
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cachedMesh.indices);
            gl.drawElements(gl.TRIANGLES, currentMesh.material.indices.length, gl.UNSIGNED_INT, 0);
            
        }
        
    }
};

export default WebGl2Renderer