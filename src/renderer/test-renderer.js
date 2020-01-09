/* eslint-disable no-console, no-bitwise, prefer-destructuring */

import Mat3 from '../math/mat3';
import ShaderBuilder from './shader-builder';
import Geometry from '../components/geometry';
import Transform3D from '../components/transform-3d';
import Uniform from './uniform';

const arrayBufferLookupTable = {
    vertex: (geometry, shaderLoc) => ({
        location: shaderLoc.VERTEX,
        bufferData: geometry.getVerticesAsFloat32Array(),
        bufferSize: geometry.getVertexVectorSize(),
    }),
    normal: (geometry, shaderLoc) => ({
        location: shaderLoc.NORMAL,
        bufferData: geometry.getNormalsAsFloat32Array(),
        bufferSize: geometry.getNormalVectorSize(),
    }),
    uv: (geometry, shaderLoc) => ({
        location: shaderLoc.UV,
        bufferData: geometry.getUvsAsFloat32Array(),
        bufferSize: geometry.getUvVectorSize(),
    }),
    vertexColor: (geometry, shaderLoc) => ({
        location: shaderLoc.VERTEX_COLOR,
        bufferData: geometry.getVertexColorsAsFloat32Array(),
        bufferSize: geometry.getVertexColorVectorSize(),
    }),
};

const setCanvasStyle = (canvas) => {
    canvas.style.position = 'relative';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
};

const getRenderables = (componentsByType, componentsByEntityId) => componentsByType.MATERIAL.map(m => ({
    id: m.getEntityId(),
    material: m,
    geometry: componentsByEntityId[m.getEntityId()].find(c => c instanceof Geometry),
    transform: componentsByEntityId[m.getEntityId()].find(c => c instanceof Transform3D),
}));

const getActiveCamera = (componentsByType, componentsByEntityId) => {
    const camera = componentsByType.CAMERA[0];
    return {
        camera,
        transform: componentsByEntityId[camera.getEntityId()].find(c => c instanceof Transform3D),
    };
};

const getDirectionalLights = (componentsByType) => componentsByType.DIRECTIONAL_LIGHT;

const getLightValuesAsFlatArray = (lights, propertyName) => lights.flatMap(l => l[propertyName].getAsArray());

class TestRenderer {
    constructor(domNode) {
        this.domNode = domNode;
        this.canvas = document.createElement('canvas');
        this.domNode.appendChild(this.canvas);
        this.canvas.width = this.domNode.clientWidth;
        this.canvas.height = this.domNode.clientHeight;
        setCanvasStyle(this.canvas);

        this.gl = this.canvas.getContext('webgl2');
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);

        this.renderableCache = {};
    }

    static get SHADER_LAYOUT_LOCATIONS() {
        return {
            VERTEX: 0,
            NORMAL: 1,
            UV: 2,
            VERTEX_COLOR: 3,
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
        const result = arrayBufferLookupTable[type](geometry, TestRenderer.SHADER_LAYOUT_LOCATIONS);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, result.bufferData, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(result.location);
        this.gl.vertexAttribPointer(result.location, result.bufferSize, this.gl.FLOAT, false, 0, 0);
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

    cacheRenderable(renderable) {
        const gl = this.gl;
        const materialClassName = renderable.material.constructor.name;
        const shaderData = ShaderBuilder[materialClassName].buildShader(TestRenderer.SHADER_LAYOUT_LOCATIONS);

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        const shader = this.createProgram(vertexShader, fragmentShader);
        console.log('cache called');

        const activeUniformsCount = this.gl.getProgramParameter(shader, this.gl.ACTIVE_UNIFORMS);
        const uniforms = [];

        for (let u = 0; u < activeUniformsCount; u++) {
            const uniformInfo = this.gl.getActiveUniform(shader, u);
            const uniformLocation = gl.getUniformLocation(shader, uniformInfo.name);
            uniforms.push(new Uniform(gl, uniformLocation, uniformInfo.name, uniformInfo.type));
        }

        const cachedRenderable = {
            vao: this.createVertexArray(renderable.geometry),
            indices: this.createElementArrayBuffer(renderable.material),
            shader,
            uniforms,
        };

        this.renderableCache[renderable.id] = cachedRenderable;
        return cachedRenderable;
    }

    render(world) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderables = getRenderables(world.componentsByType, world.componentsByEntityId);
        const activeCamera = getActiveCamera(world.componentsByType, world.componentsByEntityId);
        const directionalLights = getDirectionalLights(world.componentsByType);

        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const cachedRenderable = this.renderableCache[renderable.id] || this.cacheRenderable(renderable);

            this.gl.bindVertexArray(cachedRenderable.vao);
            this.gl.useProgram(cachedRenderable.shader);

            const mv = activeCamera.camera.viewMatrix.clone().multiply(renderable.transform.modelMatrix);
            const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);

            const uniformValueLookupTable = {
                modelMatrix: renderable.transform.modelMatrix.getAsArray(),
                normalMatrix: normalMatrix.getAsArray(),
                mv: mv.getAsArray(),
                mvp: mvp.getAsArray(),
                diffuseColor: renderable.material.diffuseColor.getAsArray(),
                specularColor: renderable.material.specularColor.getAsArray(),
                ambientIntensity: renderable.material.ambientIntensity,
                specularExponent: renderable.material.specularExponent,
                specularShininess: renderable.material.specularShininess,
                cameraPosition: activeCamera.transform.position.getAsArray(),
                'dirLightDirection[0]': getLightValuesAsFlatArray(directionalLights, 'direction'),
                'dirLightAmbientColor[0]': getLightValuesAsFlatArray(directionalLights, 'ambientColor'),
                'dirLightDiffuseColor[0]': getLightValuesAsFlatArray(directionalLights, 'diffuseColor'),
                'dirLightSpecularColor[0]': getLightValuesAsFlatArray(directionalLights, 'specularColor'),
                numDirLights: directionalLights.length,
            };

            for (let u = 0; u < cachedRenderable.uniforms.length; u++) {
                const uniform = cachedRenderable.uniforms[u];
                const uniformValue = uniformValueLookupTable[uniform.name];
                uniform.update(uniformValue);
            }

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cachedRenderable.indices);
            this.gl.drawElements(this.gl.TRIANGLES, renderable.material.indices.length, this.gl.UNSIGNED_INT, 0);
        }
    }
}

export default TestRenderer;
