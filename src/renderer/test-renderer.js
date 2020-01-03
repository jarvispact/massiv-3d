/* eslint-disable no-console, no-bitwise, prefer-destructuring */

import Mat3 from '../math/mat3';
import ShaderBuilder from './shader-builder';
import Geometry from '../components/geometry';
import AbstractMaterial from '../components/abstract-material';
import Transform3D from '../components/transform-3d';
import AbstractCamera from '../components/abstract-camera';
import DirectonalLight from '../components/directional-light';
import Vec3 from '../math/vec3';

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

const getViewNameForUniformName = (uniformName) => {
    if (uniformName.includes('[')) return uniformName;
    if (uniformName.includes('.')) return uniformName.split('.')[1];
    return uniformName;
};

const setCanvasStyle = (canvas) => {
    canvas.style.position = 'relative';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
};

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
        const result = arrayBufferLookupTable[type](geometry, this.shaderLayoutLocations);
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

    createUBO(shader, blockBinding, uniformBlockName, uniformNames, uniformValues) {
        const blockIndex = this.gl.getUniformBlockIndex(shader, uniformBlockName);
        const blockSize = this.gl.getActiveUniformBlockParameter(shader, blockIndex, this.gl.UNIFORM_BLOCK_DATA_SIZE);
        const arrayBuffer = new ArrayBuffer(blockSize);

        const uniformIndices = this.gl.getUniformIndices(shader, uniformNames);
        const uniformOffsets = this.gl.getActiveUniforms(shader, uniformIndices, this.gl.UNIFORM_OFFSET);

        // TODO: add support for different data types
        const views = uniformNames
            .map(getViewNameForUniformName)
            .reduce((accum, name, idx) => {
                accum[name] = name === 'numDirectionalLights'
                    ? new Int32Array(arrayBuffer, uniformOffsets[idx])
                    : new Float32Array(arrayBuffer, uniformOffsets[idx]);

                accum[name].set(uniformValues[idx]);
                return accum;
            }, {});

        // console.log({ uniformNames, arrayBuffer, uniformIndices, uniformOffsets, views });

        const webglBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, webglBuffer);
        this.gl.bufferData(this.gl.UNIFORM_BUFFER, arrayBuffer, this.gl.DYNAMIC_DRAW);
        this.gl.uniformBlockBinding(shader, blockIndex, blockBinding);
        this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, blockBinding, webglBuffer);

        return {
            webglBuffer,
            arrayBuffer,
            blockBinding,
            views,
        };
    }

    resize() {
        const w = this.domNode.clientWidth;
        const h = this.domNode.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    cacheMesh(mesh, { activeCamera, directionalLights }) {
        const shaderCode = ShaderBuilder.buildShaderForStandardMaterial(this.shaderLayoutLocations);
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, shaderCode.vertexShaderSourceCode);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, shaderCode.fragmentShaderSourceCode);
        const shader = this.createProgram(vertexShader, fragmentShader);

        activeCamera.camera.lookAt(activeCamera.transform.position, new Vec3(0, 0, 0));
        const mv = activeCamera.camera.viewMatrix.clone().multiply(mesh.transform.modelMatrix);
        const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
        const normalMatrix = Mat3.normalMatrixFromMat4(mv);

        const MatricesUniformUBO = this.createUBO(shader, 3, 'MatricesUniform', [
            'matrices.modelMatrix',
            'matrices.mvp',
            'matrices.normalMatrix',
        ],
        [
            mesh.transform.modelMatrix.getAsArray(),
            mvp.getAsArray(),
            normalMatrix.getAsMat4Array(),
        ]);

        // ===============================

        const MaterialUniformUBO = this.createUBO(shader, 2, 'MaterialUniform', [
            'material.diffuseColor',
            'material.specularColor',
            'material.ambientIntensity',
            'material.specularExponent',
            'material.specularShininess',
        ],
        [
            mesh.material.diffuseColor.getAsArray(),
            mesh.material.specularColor.getAsArray(),
            [mesh.material.ambientIntensity],
            [mesh.material.specularExponent],
            [mesh.material.specularShininess],
        ]);

        // ==================================

        const dirLightNames = directionalLights.flatMap((_, idx) => [
            `directionalLights[${idx}].direction`,
            `directionalLights[${idx}].ambientColor`,
            `directionalLights[${idx}].diffuseColor`,
            `directionalLights[${idx}].specularColor`,
        ]);

        const dirLightValues = directionalLights.flatMap((dirLight) => [
            dirLight.direction.getAsArray(),
            dirLight.ambientColor.getAsArray(),
            dirLight.diffuseColor.getAsArray(),
            dirLight.specularColor.getAsArray(),
        ]);

        const SceneUniformUBO = this.createUBO(shader, 1, 'SceneUniform', [
            ...dirLightNames,
            'numDirectionalLights',
            'cameraPosition',
        ], [
            ...dirLightValues,
            [directionalLights.length],
            activeCamera.transform.position.getAsArray(),
        ]);

        const cachedMesh = {
            vao: this.createVertexArray(mesh.geometry),
            indices: this.createElementArrayBuffer(mesh.material),
            shader,
            ubos: {
                MatricesUniformUBO,
                SceneUniformUBO,
                MaterialUniformUBO,
            },
        };

        this.meshCache[mesh.id] = cachedMesh;
        return cachedMesh;
    }

    render(world) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const meshes = world.entities.map(entity => {
            const transform = world.components.find(component => component instanceof Transform3D && component.entityId === entity.id);
            const geometry = world.components.find(component => component instanceof Geometry && component.entityId === entity.id);
            const material = world.components.find(component => component instanceof AbstractMaterial && component.entityId === entity.id);
            return transform && geometry && material ? { transform, geometry, material } : undefined;
        }).filter(Boolean);

        const activeCamera = world.entities.map(entity => {
            const transform = world.components.find(component => component instanceof Transform3D && component.entityId === entity.id);
            const camera = world.components.find(component => component instanceof AbstractCamera && component.entityId === entity.id);
            return transform && camera ? { transform, camera } : undefined;
        }).filter(Boolean)[0];

        const directionalLights = world.entities.map(entity => {
            const light = world.components.find(component => component instanceof DirectonalLight && component.entityId === entity.id);
            return light;
        }).filter(Boolean);

        for (let i = 0; i < meshes.length; i++) {
            const currentMesh = meshes[i];
            const cachedMesh = this.meshCache[currentMesh.id] || this.cacheMesh(currentMesh, { activeCamera, directionalLights });

            this.gl.bindVertexArray(cachedMesh.vao);
            this.gl.useProgram(cachedMesh.shader);

            const ubos = cachedMesh.ubos;

            const mv = activeCamera.camera.viewMatrix.clone().multiply(currentMesh.transform.modelMatrix);
            const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);
            ubos.MatricesUniformUBO.views.modelMatrix.set(currentMesh.transform.modelMatrix.getAsArray());
            ubos.MatricesUniformUBO.views.mvp.set(mvp.getAsArray());
            ubos.MatricesUniformUBO.views.normalMatrix.set(normalMatrix.getAsMat4Array());

            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubos.MatricesUniformUBO.webglBuffer);
            this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, ubos.MatricesUniformUBO.arrayBuffer);
            this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, ubos.MatricesUniformUBO.blockBinding, ubos.MatricesUniformUBO.webglBuffer);

            // =============================

            ubos.MaterialUniformUBO.views.diffuseColor.set(currentMesh.material.diffuseColor.getAsArray());

            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubos.MaterialUniformUBO.webglBuffer);
            this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, ubos.MaterialUniformUBO.arrayBuffer);
            this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, ubos.MaterialUniformUBO.blockBinding, ubos.MaterialUniformUBO.webglBuffer);

            // =============================

            ubos.SceneUniformUBO.views['directionalLights[0].direction'].set(directionalLights[0].direction.getAsArray());

            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubos.SceneUniformUBO.webglBuffer);
            this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, ubos.SceneUniformUBO.arrayBuffer);
            this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, ubos.SceneUniformUBO.blockBinding, ubos.SceneUniformUBO.webglBuffer);

            // =============================

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cachedMesh.indices);
            this.gl.drawElements(this.gl.TRIANGLES, currentMesh.material.indices.length, this.gl.UNSIGNED_INT, 0);
        }
    }
}

export default TestRenderer;
