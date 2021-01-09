import {
    createWebgl2ArrayBuffer,
    createWebgl2Program,
    createWebgl2Shader,
    createWebgl2VertexArray,
    glsl300,
    GLSL300ATTRIBUTE,
    setupWebgl2VertexAttribPointer,
    System,
    UBO,
    UBOConfig,
    World,
} from '../../../src';
import { LineGeometry } from '../components/line-geometry';

type CachedEntity = {
    name: string;
    update: () => void;
    cleanup: () => void;
};

const vs = glsl300({
    attributes: [GLSL300ATTRIBUTE.POSITION],
})`
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;


    void main() {
        gl_Position = camera.projectionMatrix * camera.viewMatrix * vec4(position, 1.0);
    }
`;

const fs = glsl300({
    out: [{ name: 'fragColor', type: 'vec4' }],
})`
    void main() {
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

type RenderLineSystemArgs = {
    world: World;
    gl: WebGL2RenderingContext;
    cameraUbo: UBO<UBOConfig>;
};

export const createRenderLineSystem = ({ world, gl, cameraUbo }: RenderLineSystemArgs): System => {
    let cache: Array<CachedEntity> = [];

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);
    cameraUbo.bindToShaderProgram(shaderProgram);

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const entity = action.payload;
            const lineGeometry = entity.getComponentByClass(LineGeometry);
            if (lineGeometry) {
                console.log('create line, ', lineGeometry);
                
                const vao = createWebgl2VertexArray(gl);
                const positionBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(lineGeometry.data.positions));
                setupWebgl2VertexAttribPointer(gl, 0, 3);

                gl.useProgram(shaderProgram);

                cache.push({
                    name: entity.name,
                    update: () => {                        
                        gl.bindVertexArray(vao);
                        gl.drawArrays(gl.LINES, 0, lineGeometry.data.positions.length / 3);
                    },
                    cleanup: () => {
                        gl.deleteBuffer(positionBuffer);
                        gl.deleteVertexArray(vao);
                    },
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            cache = cache.filter(item => item.name !== action.payload.name);
        }
    });

    return () => {
        gl.useProgram(shaderProgram);

        for (let i = 0; i < cache.length; i++) {
            cache[i].update();
        }
    };
};
