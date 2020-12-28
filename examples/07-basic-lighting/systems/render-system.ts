import { mat3, mat4, vec3 } from 'gl-matrix';
import { getWebgl2Context, glsl300, GLSL300ATTRIBUTE, System, World, createWebgl2Shader, createWebgl2Program, createWebgl2VertexArray, createWebgl2ArrayBuffer, setupWebgl2VertexAttribPointer, createWebgl2ElementArrayBuffer, Nullable, createTexture2D, UBO } from '../../../src';
import { Geometry } from '../components/geometry';
import { Material } from '../components/material';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Transform } from '../components/transform';

type RenderSystemArgs = {
    canvas: HTMLCanvasElement;
    world: World;
};

const vs = glsl300({
    attributes: [GLSL300ATTRIBUTE.POSITION, GLSL300ATTRIBUTE.UV, GLSL300ATTRIBUTE.NORMAL],
    out: [
        { name: 'vUv', type: 'vec2' },
        { name: 'vNormal', type: 'vec3' },
    ],
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
        mat4 modelViewMatrix;
        mat3 normalMatrix;
    };

    uniform TransformUniforms {
        Transform transform;
    };

    void main() {
        vUv = uv;
        vNormal = transform.normalMatrix * normal;
        gl_Position = camera.projectionMatrix * transform.modelViewMatrix * vec4(position, 1.0);
    }
`;

const fs = glsl300({
    in: vs.config.out,
    out: [{ name: 'fragColor', type: 'vec4' }],
})`
    uniform sampler2D diffuseMap;

    vec3 lightDirection = vec3(3.0, 1.0, 1.0);
    vec3 lightDiffuse = vec3(0.8, 0.8, 0.8);

    void main() {
        vec3 texel = texture(diffuseMap, vUv).rgb;
        vec3 ambient = texel * 0.01;
        vec3 direction = normalize(lightDirection);
        vec3 normal = normalize(vNormal);
        float diff = max(dot(normal, direction), 0.0);
        vec3 diffuse = lightDiffuse * diff * texel;
        fragColor = vec4(ambient + diffuse, 1.0);
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
    'transform.modelViewMatrix': mat4.create(),
    'transform.normalMatrix': mat3.create(),
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

                const uvBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.uvs));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.UV.location, 2);

                const normalBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.normals));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.NORMAL.location, 3);

                const indexBuffer = createWebgl2ElementArrayBuffer(gl, new Uint32Array(geometry.data.indices));
                const indexCount = geometry.data.indices.length;

                const transformUbo = new UBO(gl, 'TransformUniforms', 1, transformUboConfig).bindToShaderProgram(shaderProgram);

                const diffuseMapLocation = gl.getUniformLocation(shaderProgram, 'diffuseMap');
                const diffuseTexture = createTexture2D(gl, material.data.diffuseMap);
                gl.activeTexture(gl.TEXTURE0 + 0);
                gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
                gl.uniform1i(diffuseMapLocation, 0);

                const modelViewMatrix = mat4.create();
                const normalMatrix = mat3.create();

                cache.push({
                    entityName: action.payload.name,
                    update: () => {
                        transformUbo.bindBase();
                        if (transform.data.dirty || cameraCache.camera.data.dirty) {
                            transform.data.dirty = false;
                            mat4.multiply(modelViewMatrix, cameraCache.camera.data.viewMatrix, transform.data.modelMatrix);
                            mat3.normalFromMat4(normalMatrix, modelViewMatrix);
                            transformUbo
                                .setMat4('transform.modelMatrix', transform.data.modelMatrix)
                                .setMat4('transform.modelViewMatrix', modelViewMatrix)
                                .setMat3('transform.normalMatrix', normalMatrix)
                                .update();
                        }

                        gl.activeTexture(gl.TEXTURE0 + 0);
                        gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
                        gl.uniform1i(diffuseMapLocation, 0);

                        gl.bindVertexArray(vao);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
                    },
                    cleanup: () => {
                        gl.deleteBuffer(positionBuffer);
                        gl.deleteBuffer(uvBuffer);
                        gl.deleteBuffer(normalBuffer);
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

    return () => {
        if (cameraCache.camera.data.dirty) {
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

        cameraCache.camera.data.dirty = false;
    };
};