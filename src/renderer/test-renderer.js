/* eslint-disable no-console, no-bitwise */

import Mat3 from '../math/mat3';
import ShaderBuilder from './shader-builder';
import Geometry from '../core/geometry';
import Material from '../material/material';
import Transform3D from '../core/transform-3d';
import Camera from '../camera/camera';
import DirectonalLight from '../light/directional-light';
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

class TestRenderer {
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

    createUBO(shader, blockBinding, uniformBlockName, uniformNames, uniformValues) {
        const { gl } = this;

        const blockIndex = gl.getUniformBlockIndex(shader, uniformBlockName);
        const blockSize = gl.getActiveUniformBlockParameter(shader, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
        const arrayBuffer = new ArrayBuffer(blockSize);

        const uniformIndices = gl.getUniformIndices(shader, uniformNames);
        const uniformOffsets = gl.getActiveUniforms(shader, uniformIndices, gl.UNIFORM_OFFSET);

        // TODO: add support for different data types
        const views = uniformNames
            .map(getViewNameForUniformName)
            .reduce((accum, name, idx) => {
                accum[name] = name === 'numDirectionalLights' ? new Int32Array(arrayBuffer, uniformOffsets[idx]) : new Float32Array(arrayBuffer, uniformOffsets[idx]);
                accum[name].set(uniformValues[idx]);
                return accum;
            }, {});

        // console.log({ uniformNames, arrayBuffer, uniformIndices, uniformOffsets, views });

        const webglBuffer = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, webglBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, arrayBuffer, gl.DYNAMIC_DRAW);
        gl.uniformBlockBinding(shader, blockIndex, blockBinding);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, blockBinding, webglBuffer);

        return {
            webglBuffer,
            arrayBuffer,
            blockBinding,
            views,
        };
    }

    resize() {
        const { gl, canvas, domNode } = this;
        const w = domNode.clientWidth;
        const h = domNode.clientHeight;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    cacheMesh(mesh, { activeCamera, directionalLights }) {
        const { gl, shaderLayoutLocations } = this;

        const { vertexShaderSourceCode, fragmentShaderSourceCode } = ShaderBuilder.buildShaderForStandardMaterial(shaderLayoutLocations);
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSourceCode);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSourceCode);
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
        const { gl } = this;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const meshes = world.entities.map(entity => {
            const transform = world.components.find(component => component instanceof Transform3D && component.entityId === entity.id);
            const geometry = world.components.find(component => component instanceof Geometry && component.entityId === entity.id);
            const material = world.components.find(component => component instanceof Material && component.entityId === entity.id);
            return transform && geometry && material ? { transform, geometry, material } : undefined;
        }).filter(Boolean);

        const activeCamera = world.entities.map(entity => {
            const transform = world.components.find(component => component instanceof Transform3D && component.entityId === entity.id);
            const camera = world.components.find(component => component instanceof Camera && component.entityId === entity.id);
            return transform && camera ? { transform, camera } : undefined;
        }).filter(Boolean)[0];

        const directionalLights = world.entities.map(entity => {
            const light = world.components.find(component => component instanceof DirectonalLight && component.entityId === entity.id);
            return light;
        }).filter(Boolean);

        for (let i = 0; i < meshes.length; i++) {
            const currentMesh = meshes[i];
            const cachedMesh = this.meshCache[currentMesh.id] || this.cacheMesh(currentMesh, { activeCamera, directionalLights });

            gl.bindVertexArray(cachedMesh.vao);
            gl.useProgram(cachedMesh.shader);

            const { MatricesUniformUBO, MaterialUniformUBO, SceneUniformUBO } = cachedMesh.ubos;

            const mv = activeCamera.camera.viewMatrix.clone().multiply(currentMesh.transform.modelMatrix);
            const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);
            MatricesUniformUBO.views.modelMatrix.set(currentMesh.transform.modelMatrix.getAsArray());
            MatricesUniformUBO.views.mvp.set(mvp.getAsArray());
            MatricesUniformUBO.views.normalMatrix.set(normalMatrix.getAsMat4Array());

            gl.bindBuffer(gl.UNIFORM_BUFFER, MatricesUniformUBO.webglBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, MatricesUniformUBO.arrayBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, MatricesUniformUBO.blockBinding, MatricesUniformUBO.webglBuffer);

            // =============================

            MaterialUniformUBO.views.diffuseColor.set(currentMesh.material.diffuseColor.getAsArray());

            gl.bindBuffer(gl.UNIFORM_BUFFER, MaterialUniformUBO.webglBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, MaterialUniformUBO.arrayBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, MaterialUniformUBO.blockBinding, MaterialUniformUBO.webglBuffer);

            // =============================

            SceneUniformUBO.views['directionalLights[0].direction'].set(directionalLights[0].direction.getAsArray());

            gl.bindBuffer(gl.UNIFORM_BUFFER, SceneUniformUBO.webglBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, SceneUniformUBO.arrayBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, SceneUniformUBO.blockBinding, SceneUniformUBO.webglBuffer);

            // =============================

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cachedMesh.indices);
            gl.drawElements(gl.TRIANGLES, currentMesh.material.indices.length, gl.UNSIGNED_INT, 0);
        }
    }
}

export default TestRenderer;
