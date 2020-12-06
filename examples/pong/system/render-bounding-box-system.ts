import { mat4, vec3 } from 'gl-matrix';
import {
    BoundingBox,
    createWebgl2ArrayBuffer,
    createWebgl2ElementArrayBuffer,
    createWebgl2Program,
    createWebgl2Shader,
    createWebgl2VertexArray,
    Entity,
    glsl300,
    setupWebgl2VertexAttribPointer,
    System,
    Transform,
    UBO,
} from '../../../src';
import { world } from '../world';

type CachedEntity = {
    update: () => void;
    cleanup: () => void;
};

const cameraUBOConfig = {
    'CameraUniforms.translation': { data: vec3.fromValues(0, 0, 0) },
    'CameraUniforms.viewMatrix': { data: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) },
    'CameraUniforms.projectionMatrix': { data: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) },
};

type UBOConfig = typeof cameraUBOConfig;

export const createRenderBoundingBoxSystem = (gl: WebGL2RenderingContext, cameraUbo: UBO<UBOConfig>): System => {
    const cache: Record<string, CachedEntity> = {};

    const createCachedEntity = (entity: Entity) => {
        const transform = entity.getComponentByClass(Transform);
        const boundingBox = entity.getComponentByClass(BoundingBox);

        const vs = glsl300({
            attributes: [{ name: 'position', type: 'vec3', location: 0 }],
        })`
            uniform CameraUniforms {
                vec3 translation;
                mat4 viewMatrix;
                mat4 projectionMatrix;
            } camera;

            uniform mat4 modelMatrix;

            void main() {
                gl_Position = camera.projectionMatrix * camera.viewMatrix * modelMatrix * vec4(position, 1.0);
            }
        `;

        const fs = glsl300({
            out: [{ name: 'fragColor', type: 'vec4' }],
        })`
            void main() {
                fragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;

        const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
        const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
        const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
        const vao = createWebgl2VertexArray(gl);

        const lineGeometry = boundingBox.getLineGeometry();
        const positionBuffer = createWebgl2ArrayBuffer(gl, lineGeometry.data.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);
        const indexBuffer = createWebgl2ElementArrayBuffer(gl, lineGeometry.data.indices);
        const indexCount = lineGeometry.data.indices.length;

        gl.useProgram(shaderProgram);
        cameraUbo.bindToShaderProgram(shaderProgram);

        const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

        const cachedEntity = {
            update: () => {
                gl.useProgram(shaderProgram);

                gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

                gl.bindVertexArray(vao);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.drawElements(gl.LINES, indexCount, gl.UNSIGNED_INT, 0);
            },
            cleanup: () => {
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteProgram(shaderProgram);
                gl.deleteBuffer(positionBuffer);
                gl.deleteBuffer(indexBuffer);
                gl.deleteVertexArray(vao);
            },
        };

        cache[entity.name] = cachedEntity;
        return cachedEntity;
    };

    return () => {
        const entities = world.queryEntities(['Transform', 'BoundingBox']);
        for (let e = 0; e < entities.length; e++) {
            const entity = entities[e];
            if (!cache[entity.name]) createCachedEntity(entity);
            cache[entity.name].update();
        }
    };
};
