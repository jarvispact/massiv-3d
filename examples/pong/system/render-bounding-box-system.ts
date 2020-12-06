import {
    BoundingBox,
    createWebgl2ArrayBuffer,
    createWebgl2ElementArrayBuffer,
    createWebgl2Program,
    createWebgl2Shader,
    createWebgl2VertexArray,
    glsl300,
    setupWebgl2VertexAttribPointer,
    System,
    Transform,
} from '../../../src';
import { CameraUBO } from '../misc';
import { world } from '../world';

type CachedEntity = {
    name: string;
    update: () => void;
    cleanup: () => void;
};

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

export const createRenderBoundingBoxSystem = (gl: WebGL2RenderingContext, cameraUbo: CameraUBO): System => {
    const cache: Array<CachedEntity> = [];

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);
    cameraUbo.bindToShaderProgram(shaderProgram);

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const entity = action.payload;
            const transform = entity.getComponentByClass(Transform);
            const boundingBox = entity.getComponentByClass(BoundingBox);
            if (transform && boundingBox) {
                const vao = createWebgl2VertexArray(gl);
                const lineGeometry = boundingBox.getLineGeometry();
                const positionBuffer = createWebgl2ArrayBuffer(gl, lineGeometry.data.positions);
                setupWebgl2VertexAttribPointer(gl, 0, 3);
                const indexBuffer = createWebgl2ElementArrayBuffer(gl, lineGeometry.data.indices);
                const indexCount = lineGeometry.data.indices.length;

                gl.useProgram(shaderProgram);
                const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
                gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

                cache.push({
                    name: entity.name,
                    update: () => {
                        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

                        gl.bindVertexArray(vao);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(gl.LINES, indexCount, gl.UNSIGNED_INT, 0);
                    },
                    cleanup: () => {
                        gl.deleteBuffer(positionBuffer);
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

    return () => {
        gl.useProgram(shaderProgram);

        for (let i = 0; i < cache.length; i++) {
            cache[i].update();
        }
    };
};
