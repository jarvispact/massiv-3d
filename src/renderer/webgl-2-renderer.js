
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
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) return shader;
        console.error(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return undefined;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (success) return program;
        console.error(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
        return undefined;
    }

    createTexture(image) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = this.gl.RGBA;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;

        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        return texture;
    }

    createArrayBuffer(type, geometry) {
        const { location, bufferData, bufferSize } = arrayBufferLookupTable[type](geometry, this.shaderLayoutLocations);        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, bufferSize, this.gl.FLOAT, false, 0, 0);
    }

    createVertexArray(geometry) {
        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);

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
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, material.getIndicesAsUint32Array(), this.gl.STATIC_DRAW);
        return buffer;
    }

    resize() {
        const w = this.domNode.clientWidth;
        const h = this.domNode.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    // TODO cache scene
    render(scene) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        const { activeCamera, meshes } = scene.getChildrenRecursive();

        for (let i = 0; i < meshes.length; i++) {
            meshes[i].computeModelMatrix(); // TODO: parent-child relationship
            const { geometry, material, modelMatrix } = meshes[i];

            const materialArgs = {
                shaderLayoutLocations: this.shaderLayoutLocations,
            };

            const vertexShader = this.createShader(this.gl.VERTEX_SHADER, material.getVertexShaderSourceCode(materialArgs));
            const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, material.getFragmentShaderSourceCode(materialArgs));
            const shader = this.createProgram(vertexShader, fragmentShader);

            const mv = activeCamera.viewMatrix.clone().multiply(modelMatrix);
            const mvp = activeCamera.projectionMatrix.clone().multiply(mv);
            

            const renderable = {
                vao: this.createVertexArray(geometry),
                indices: this.createElementArrayBuffer(material),
                shader,
                mvpShaderUniformLocation: this.gl.getUniformLocation(shader, 'mvp'),
            };

            this.gl.bindVertexArray(renderable.vao);
            this.gl.useProgram(renderable.shader);
            this.gl.uniformMatrix4fv(renderable.mvpShaderUniformLocation, false, mvp.getAsFloat32Array());
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, renderable.indices);
            this.gl.drawElements(this.gl.TRIANGLES, material.indices.length, this.gl.UNSIGNED_INT, 0);
            
        }
        
    }
};

export default WebGl2Renderer