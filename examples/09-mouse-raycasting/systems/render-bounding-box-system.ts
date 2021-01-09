import {
    createWebgl2ArrayBuffer,
    updateWebgl2ArrayBuffer,
    createWebgl2Program,
    createWebgl2Shader,
    createWebgl2VertexArray,
    glsl300,
    setupWebgl2VertexAttribPointer,
    System,
    UBO,
    UBOConfig,
    World,
} from '../../../src';
import { BoundingBox } from '../components/bounding-box';
import { Geometry } from '../components/geometry';
import { Transform } from '../components/transform';

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

type RenderBoundingBoxSystemArgs = {
    world: World;
    gl: WebGL2RenderingContext;
    cameraUbo: UBO<UBOConfig>;
};

export const createRenderBoundingBoxSystem = ({ world, gl, cameraUbo }: RenderBoundingBoxSystemArgs): System => {
    let cache: Array<CachedEntity> = [];

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs.sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);
    cameraUbo.bindToShaderProgram(shaderProgram);

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const entity = action.payload;
            const transform = entity.getComponentByClass(Transform);
            const geometry = entity.getComponentByClass(Geometry);
            const boundingBox = entity.getComponentByClass(BoundingBox);
            if (transform && geometry && boundingBox) {
                const vao = createWebgl2VertexArray(gl);
                const positions = boundingBox.getLineGeometryPositions();
                const positionBuffer = createWebgl2ArrayBuffer(gl, positions, gl.DYNAMIC_DRAW);
                setupWebgl2VertexAttribPointer(gl, 0, 3);

                cache.push({
                    name: entity.name,
                    update: () => {
                        gl.bindVertexArray(vao);

                        // if (transform.data.dirty) {
                        //     // console.log('transform is dirty');
                        //     boundingBox.updateFromGeometry(geometry);
                        //     const newPositions = boundingBox.getLineGeometryPositions();
                        //     updateWebgl2ArrayBuffer(gl, positionBuffer, newPositions);
                        //     gl.drawArrays(gl.LINES, 0, newPositions.length / 3);
                        // } else {
                        gl.drawArrays(gl.LINES, 0, positions.length / 3);
                        // }
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
