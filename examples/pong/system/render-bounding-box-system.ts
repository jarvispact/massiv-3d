import { mat4, vec3 } from 'gl-matrix';
import {
    BoundingBox,
    createWebgl2ArrayBuffer,
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

        const min = boundingBox.data.min;
        const max = boundingBox.data.max;

        const positions = new Float32Array([
            // line 1
            min[0], min[1], max[2], // -x -y +z
            max[0], min[1], max[2], // +x -y +z
            // line 2
            min[0], max[1], max[2], // -x +y +z
            max[0], max[1], max[2], // +x +y +z
            // line 3
            min[0], min[1], min[2], // -x -y -z
            max[0], min[1], min[2], // +x -y -z
            // line 4
            min[0], max[1], min[2], // -x +y -z
            max[0], max[1], min[2], // +x +y -z
            // line 5
            max[0], min[1], max[2], // +x -y +z
            max[0], min[1], min[2], // +x -y -z
            // line 6
            max[0], max[1], max[2], // +x +y +z
            max[0], max[1], min[2], // +x +y -z
            // line 5
            min[0], min[1], max[2], // -x -y +z
            min[0], min[1], min[2], // -x -y -z
            // line 6
            min[0], max[1], max[2], // -x +y +z
            min[0], max[1], min[2], // -x +y -z
            // line 7
            min[0], min[1], max[2], // -x -y +z
            min[0], max[1], max[2], // -x +y +z
            // line 8
            max[0], min[1], max[2], // +x -y +z
            max[0], max[1], max[2], // +x +y +z
            // line 9
            min[0], min[1], min[2], // -x -y -z
            min[0], max[1], min[2], // -x +y -z
            // line 10
            max[0], min[1], min[2], // +x -y -z
            max[0], max[1], min[2], // +x +y -z
        ]);

        const positionBuffer = createWebgl2ArrayBuffer(gl, positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        gl.useProgram(shaderProgram);
        cameraUbo.bindToShaderProgram(shaderProgram);

        const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

        const cachedEntity = {
            update: () => {
                gl.useProgram(shaderProgram);
                gl.bindVertexArray(vao);
                gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                gl.drawArrays(gl.LINES, 0, positions.length);
            },
            cleanup: () => {
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteProgram(shaderProgram);
                gl.deleteBuffer(positionBuffer);
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
