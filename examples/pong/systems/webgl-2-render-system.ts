import { createWebgl2ArrayBuffer, createWebgl2ElementArrayBuffer, createWebgl2Program, createWebgl2Shader, createWebgl2VertexArray, Entity, getWebgl2Context, glsl300, setupWebgl2VertexAttribPointer, UBO } from '../../../src';
import { Transform } from '../components/transform';
import { Geometry } from '../components/geometry';
import { Camera } from '../camera/camera';
import { world } from '../world';
import { OrthographicCamera } from '../camera/orthographic-camera';

type CachedEntity = {
    update: () => void;
    cleanup: () => void;
};

export const createWebgl2RenderSystem = (canvas: HTMLCanvasElement, camera: Camera) => {
    const gl = getWebgl2Context(canvas);
    const cache: Record<string, CachedEntity> = {};

    const ubo = new UBO(gl, 'CameraUniforms', 0, {
        'CameraUniforms.translation': { data: camera.translation },
        'CameraUniforms.viewMatrix': { data: camera.viewMatrix },
        'CameraUniforms.projectionMatrix': { data: camera.projectionMatrix },
    });

    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        const aspect = canvas.width / canvas.height;
        if (camera instanceof OrthographicCamera) {
            camera.setFrustum(-aspect * 10, aspect * 10, -10, 10, -10, 10);
            ubo.setView('CameraUniforms.projectionMatrix', camera.projectionMatrix).update();
        }
    });

    const createCachedEntity = (entity: Entity) => {
        const transform = entity.getComponent('Transform') as Transform;
        const geometry = entity.getComponent('Geometry') as Geometry;

        const vs = glsl300({
            attributes: [
                { name: 'position', type: 'vec3', location: 0 },
            ],
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
            out: [
                { name: 'fragColor', type: 'vec4' }
            ],
        })`
            void main() {
                fragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;

        const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
        const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
        const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
        const vao = createWebgl2VertexArray(gl);

        const positionBuffer = createWebgl2ArrayBuffer(gl, geometry.data.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const indexBuffer = createWebgl2ElementArrayBuffer(gl, geometry.data.indices);
        const indexCount = geometry.data.indices.length;

        gl.useProgram(shaderProgram);
        ubo.bindToShaderProgram(shaderProgram);

        const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

        const cachedEntity = {
            update: () => {
                gl.useProgram(shaderProgram);
                gl.bindVertexArray(vao);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                if (Transform.isDirty(transform)) {
                    gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                    Transform.setDirty(transform, false);
                }
                gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
            },
            cleanup: () => {
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteProgram(shaderProgram);
                gl.deleteBuffer(positionBuffer);
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