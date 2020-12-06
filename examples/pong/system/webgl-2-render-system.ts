import { createWebgl2ArrayBuffer, createWebgl2ElementArrayBuffer, createWebgl2Program, createWebgl2Shader, createWebgl2VertexArray, Geometry, getWebgl2Context, glsl300, setupWebgl2VertexAttribPointer, System, Transform, UBO } from '../../../src';
import { world } from '../world';
import { Camera } from '../camera/camera';
import { vec3 } from 'gl-matrix';
import { PerspectiveCamera } from '../camera/perspective-camera';
import { createRenderBoundingBoxSystem } from './render-bounding-box-system';

type CachedEntity = {
    name: string;
    update: () => void;
    cleanup: () => void;
};

const vs = glsl300({
    attributes: [
        { name: 'position', type: 'vec3', location: 0 },
        { name: 'normal', type: 'vec3', location: 1 },
    ],
    out: [
        { name: 'vNormal', type: 'vec3' },
        { name: 'fragmentPos', type: 'vec3' },
    ],
})`
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;

    uniform mat4 modelMatrix;

    void main() {
        mat4 modelViewMatrix = camera.viewMatrix * modelMatrix;
        mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
        vNormal = normalMatrix * normal;
        fragmentPos = vec3(modelMatrix * vec4(position, 1.0));
        gl_Position = camera.projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fs = glsl300({
    in: vs.config.out,
    out: [
        { name: 'fragColor', type: 'vec4' }
    ],
})`
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 lightPos = vec3(1.0, 3.0, 5.0);
    float lightIntensity = 0.8;
    vec3 center = vec3(0.0, 0.0, 0.0);

    uniform vec3 color;

    void main() {
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(lightPos - fragmentPos);

        float ambientStrength = 0.1;
        vec3 ambient = ambientStrength * lightColor;

        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * lightColor * lightIntensity;

        vec3 result = (ambient + diffuse) * color;
        fragColor = vec4(result, 1.0);
    }
`;

export const createWebgl2RenderSystem = (canvas: HTMLCanvasElement, camera: Camera): System => {
    const gl = getWebgl2Context(canvas);
    const cache: Array<CachedEntity> = [];

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    const ubo = new UBO(gl, 'CameraUniforms', 0, {
        'CameraUniforms.translation': { data: camera.translation },
        'CameraUniforms.viewMatrix': { data: camera.viewMatrix },
        'CameraUniforms.projectionMatrix': { data: camera.projectionMatrix },
    });

    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (camera instanceof PerspectiveCamera) {
            camera.setAspect(canvas.width / canvas.height);
            ubo.setView('CameraUniforms.projectionMatrix', camera.projectionMatrix).update();
        }
    });

    ubo.bindToShaderProgram(shaderProgram);
    const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
    const colorLocation = gl.getUniformLocation(shaderProgram, 'color');

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const entity = action.payload;
            const transform = entity.getComponentByClass(Transform);
            const geometry = entity.getComponentByClass(Geometry);
            const color = entity.getComponentByType('Color') as {type: 'Color', data: vec3};

            if (transform && geometry && color) {
                const vao = createWebgl2VertexArray(gl);
                const positionBuffer = createWebgl2ArrayBuffer(gl, geometry.data.positions);
                setupWebgl2VertexAttribPointer(gl, 0, 3);
                const normalBuffer = createWebgl2ArrayBuffer(gl, geometry.data.normals);
                setupWebgl2VertexAttribPointer(gl, 1, 3);
                const indexBuffer = createWebgl2ElementArrayBuffer(gl, geometry.data.indices);
                const indexCount = geometry.data.indices.length;

                gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                gl.uniform3fv(colorLocation, color.data);

                cache.push({
                    name: entity.name,
                    update: () => {
                        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                        gl.uniform3fv(colorLocation, color.data);
                        gl.bindVertexArray(vao);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
                    },
                    cleanup: () => {
                        gl.deleteBuffer(positionBuffer);
                        gl.deleteBuffer(normalBuffer);
                        gl.deleteVertexArray(vao);
                        gl.deleteBuffer(indexBuffer);
                    },
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            const cachedItem = cache.find(item => item.name === action.payload.name);
            if (cachedItem) cachedItem.cleanup();
        }
    });

    // const renderBBSystem = createRenderBoundingBoxSystem(gl, ubo);

    return (delta, time) => {
        // gl.useProgram(shaderProgram);

        for (let i = 0; i < cache.length; i++) {
            cache[i].update();
        }

        // renderBBSystem(delta, time);
    };
};