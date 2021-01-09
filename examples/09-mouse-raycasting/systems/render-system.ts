import { mat4, vec3 } from 'gl-matrix';
import { getWebgl2Context, glsl300, GLSL300ATTRIBUTE, System, World, createWebgl2Shader, createWebgl2Program, createWebgl2VertexArray, createWebgl2ArrayBuffer, setupWebgl2VertexAttribPointer, createWebgl2ElementArrayBuffer, Nullable, createTexture2D, UBO } from '../../../src';
import { Geometry } from '../components/geometry';
import { Material } from '../components/material';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Transform } from '../components/transform';
import { createRenderBoundingBoxSystem } from './render-bounding-box-system';
import { createRenderLineSystem } from './render-line-system';

type RenderSystemArgs = {
    canvas: HTMLCanvasElement;
    world: World;
};

const vs = glsl300({
    attributes: [GLSL300ATTRIBUTE.POSITION],
})`
    struct Camera {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    };

    uniform CameraUniforms {
        Camera camera;
    };

    struct Transform {
        mat4 modelMatrix;
    };

    uniform TransformUniforms {
        Transform transform;
    };

    void main() {
        gl_Position = camera.projectionMatrix * camera.viewMatrix * transform.modelMatrix * vec4(position, 1.0);
    }
`;

const fs = glsl300({
    out: [{ name: 'fragColor', type: 'vec4' }],
})`
    uniform vec3 diffuseColor;

    void main() {
        fragColor = vec4(diffuseColor, 1.0);
    }
`;

const cameraUboConfig = {
    'camera.translation': vec3.create(),
    'camera.viewMatrix': mat4.create(),
    'camera.projectionMatrix': mat4.create(),
};

type CachedCamera = {
    camera: PerspectiveCamera;
    ubo: UBO<typeof cameraUboConfig>;
};

const transformUboConfig = {
    'transform.modelMatrix': mat4.create(),
};

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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cameraCache: CachedCamera = {
        ubo: new UBO(gl, 'CameraUniforms', 0, cameraUboConfig).bindToShaderProgram(shaderProgram),
    };

    const cache: Array<Nullable<CachedItem>> = [];

    window.addEventListener('unload', () => {
        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) cachedItem.cleanup();
        }
    });

    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        const cam = cameraCache.camera;
        cam.data.aspect = canvas.width / canvas.height;
        mat4.perspective(cam.data.projectionMatrix, cam.data.fov, cam.data.aspect, cam.data.near, cam.data.far);
        cam.data.dirty = true;
    });

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const camera = action.payload.getComponentByClass(PerspectiveCamera);
            const transform = action.payload.getComponentByClass(Transform);
            const geometry = action.payload.getComponentByClass(Geometry);
            const material = action.payload.getComponentByClass(Material);
            if (camera) {
                cameraCache.camera = camera;
            } else if (transform && geometry && material) {                
                const vao = createWebgl2VertexArray(gl);

                const positionBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.positions));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.POSITION.location, 3);

                const indexBuffer = createWebgl2ElementArrayBuffer(gl, new Uint32Array(geometry.data.indices));
                const indexCount = geometry.data.indices.length;

                const transformUbo = new UBO(gl, 'TransformUniforms', 1, transformUboConfig).bindToShaderProgram(shaderProgram);

                const diffuseColorLocation = gl.getUniformLocation(shaderProgram, 'diffuseColor');

                cache.push({
                    entityName: action.payload.name,
                    update: () => {
                        transformUbo.bindBase();
                        if (transform.data.dirty) {
                            transform.data.dirty = false;
                            transformUbo.setMat4('transform.modelMatrix', transform.data.modelMatrix).update();
                        }

                        gl.uniform3fv(diffuseColorLocation, material.data.diffuseColor);

                        gl.bindVertexArray(vao);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
                    },
                    cleanup: () => {
                        gl.deleteBuffer(positionBuffer);
                        gl.deleteBuffer(indexBuffer);
                        gl.deleteVertexArray(vao);
                    },
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            for (let i = 0; i < cache.length; i++) {
                const cachedItem = cache[i];
                if (cachedItem && cachedItem.entityName === action.payload.name) {
                    cachedItem.cleanup();
                    cache[i] = null;
                }
            }
        }
    });

    const renderLineSystem = createRenderLineSystem({ world, gl, cameraUbo: cameraCache.ubo });
    const renderBBSystem = createRenderBoundingBoxSystem({ world, gl, cameraUbo: cameraCache.ubo });

    return (delta, time) => {
        renderBBSystem(delta, time);
        renderLineSystem(delta, time);

        gl.useProgram(shaderProgram);

        if (cameraCache.camera.data.dirty) {
            cameraCache.camera.data.dirty = false;
            cameraCache.ubo
                .setVec3('camera.translation', cameraCache.camera.data.translation)
                .setMat4('camera.viewMatrix', cameraCache.camera.data.viewMatrix)
                .setMat4('camera.projectionMatrix', cameraCache.camera.data.projectionMatrix)
                .update();
        }

        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) cachedItem.update();
        }
    };
};