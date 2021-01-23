import { getWebgl2Context, glsl300, GLSL300ATTRIBUTE, System, World, createWebgl2Shader, createWebgl2Program, createWebgl2VertexArray, createWebgl2ArrayBuffer, setupWebgl2VertexAttribPointer, createWebgl2ElementArrayBuffer, Nullable } from '../../../src';
import { Geometry } from '../components/geometry';

type RenderSystemArgs = {
    canvas: HTMLCanvasElement;
    world: World;
};

const vs = glsl300({
    attributes: [GLSL300ATTRIBUTE.POSITION, GLSL300ATTRIBUTE.COLOR],
    out: [{ name: 'vColor', type: 'vec3' }],
})`
    void main() {
        vColor = color;
        gl_Position = vec4(position, 1.0);
    }
`;

const fs = glsl300({
    in: vs.config.out,
    out: [{ name: 'fragColor', type: 'vec4' }],
})`
    void main() {
        fragColor = vec4(normalize(vColor), 1.0);
    }
`;

type CachedItem = {
    entityName: string;
    update: () => void;
    cleanup: () => void;
};

export const createRenderSystem = ({ canvas, world }: RenderSystemArgs): System => {
    const gl = getWebgl2Context(canvas);

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    const cache: Array<Nullable<CachedItem>> = [];

    window.addEventListener('unload', () => {
        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) cachedItem.cleanup();
        }
    });

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const geometry = world.getComponent(action.payload, Geometry);
            if (geometry) {
                const vao = createWebgl2VertexArray(gl);

                const positionBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.positions));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.POSITION.location, 3);

                const colorBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.colors));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.COLOR.location, 3);

                const indexBuffer = createWebgl2ElementArrayBuffer(gl, new Uint32Array(geometry.data.indices));
                const indexCount = geometry.data.indices.length;

                cache.push({
                    entityName: action.payload,
                    update: () => {
                        gl.bindVertexArray(vao);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
                    },
                    cleanup: () => {
                        gl.deleteBuffer(positionBuffer);
                        gl.deleteBuffer(colorBuffer);
                        gl.deleteBuffer(indexBuffer);
                        gl.deleteVertexArray(vao);
                    },
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            for (let i = 0; i < cache.length; i++) {
                const cachedItem = cache[i];
                if (cachedItem && cachedItem.entityName === action.payload) {
                    cachedItem.cleanup();
                    cache[i] = null;
                }
            }
        }
    });

    return () => {
        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) cachedItem.update();
        }
    };
};