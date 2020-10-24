import { createWebgl2ArrayBuffer, createWebgl2ElementArrayBuffer, createWebgl2Program, createWebgl2Shader, createWebgl2VertexArray, Entity, glsl300, setupWebgl2VertexAttribPointer, World } from '../../src';
import { Transform } from './transform';
import { Geometry } from './geometry';

type CachedEntity = {
    update: () => void;
    cleanup: () => void;
};

type CreateRenderSystemArgs = {
    onCacheEntity: (shaderProgram: WebGLProgram) => void;
};

export const createRenderSystem = (gl: WebGL2RenderingContext, world: World, args: CreateRenderSystemArgs) => {
    const cache: Record<string, CachedEntity> = {};

    const createCachedEntity = (entity: Entity) => {
        const transform = entity.getComponent(Transform);
        const geometry = entity.getComponent(Geometry);

        const vs = glsl300({
            attributes: [
                { name: 'position', type: 'vec3', location: 0 },
                { name: 'normal', type: 'vec3', location: 1 },
            ],
            out: [
                { name: 'vNormal', type: 'vec3' },
            ],
        })`
            uniform CameraUniforms {
                vec3 translation;
                mat4 viewMatrix;
                mat4 projectionMatrix;
            } camera;

            uniform mat4 modelMatrix;

            void main() {
                mat4 normalMatrix = transpose(inverse(camera.viewMatrix * modelMatrix));
                vNormal = mat3(normalMatrix) * normal;
                gl_Position = camera.projectionMatrix * camera.viewMatrix * modelMatrix * vec4(position, 1.0);
            }
        `;

        const fs = glsl300({
            in: vs.config.out,
            out: [
                { name: 'fragColor', type: 'vec4' }
            ],
        })`
            uniform vec3 color;

            void main() {
                fragColor = vec4(vNormal, 1.0);
            }
        `;

        const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
        const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
        const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
        const vao = createWebgl2VertexArray(gl);

        const positionBuffer = createWebgl2ArrayBuffer(gl, geometry.data.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const colorBuffer = createWebgl2ArrayBuffer(gl, geometry.data.normals);
        setupWebgl2VertexAttribPointer(gl, 1, 3);

        const indexBuffer = createWebgl2ElementArrayBuffer(gl, geometry.data.indices);
        const indexCount = geometry.data.indices.length;

        gl.useProgram(shaderProgram);
        args.onCacheEntity(shaderProgram);

        const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

        const cachedEntity = {
            update: () => {
                gl.useProgram(shaderProgram);
                gl.bindVertexArray(vao);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
            },
            cleanup: () => {
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteProgram(shaderProgram);
                gl.deleteBuffer(positionBuffer);
                gl.deleteBuffer(colorBuffer);
                gl.deleteVertexArray(vao);
                gl.deleteBuffer(indexBuffer);
            },
        };

        cache[entity.name] = cachedEntity;
        return cachedEntity;
    };

    return () => {
        const entities = world.queryEntities(['Transform', 'Geometry']);
        for (let e = 0; e < entities.length; e++) {
            const entity = entities[e];
            if (!cache[entity.name]) createCachedEntity(entity);
            cache[entity.name].update();
        }
    };
};