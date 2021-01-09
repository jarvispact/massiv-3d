import { mat3, mat4, vec3 } from 'gl-matrix';
import { getWebgl2Context, glsl300, GLSL300ATTRIBUTE, System, World, createWebgl2Shader, createWebgl2Program, createWebgl2VertexArray, createWebgl2ArrayBuffer, setupWebgl2VertexAttribPointer, createWebgl2ElementArrayBuffer, Nullable, createTexture2D, UBO, createMap, UBOConfig } from '../../../src';
import { Geometry } from '../components/geometry';
import { PhongMaterial } from '../components/phong-material';
import { DirectionalLight } from '../components/directional-light';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Transform } from '../components/transform';

const cameraUniforms = `
    struct Camera {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    };

    uniform CameraUniforms {
        Camera camera;
    };
`.trim();

const materialUniforms = `
    struct Material {
        float ambientIntensity;
        vec3 diffuseColor;
        vec3 specularColor;
        float specularExponent;
        float opacity;
        int useDiffuseMap;
    };

    uniform MaterialUniforms {
        Material material;
    };
`.trim();

type RenderSystemArgs = {
    canvas: HTMLCanvasElement;
    world: World;
    maxDirectionalLights?: number;
};

const vs = glsl300({
    attributes: [GLSL300ATTRIBUTE.POSITION, GLSL300ATTRIBUTE.UV, GLSL300ATTRIBUTE.NORMAL],
    out: [
        { name: 'vUv', type: 'vec2' },
        { name: 'vNormal', type: 'vec3' },
        { name: 'vPosition', type: 'vec3' },
    ],
})`
    ${cameraUniforms}

    struct Transform {
        mat4 modelMatrix;
        mat4 modelViewMatrix;
        mat3 normalMatrix;
    };

    uniform TransformUniforms {
        Transform transform;
    };

    ${materialUniforms}

    void main() {
        vec4 worldPosition = vec4(position, 1.0);
        vPosition = vec3(transform.modelMatrix * worldPosition);
        vNormal = transform.normalMatrix * normal;
        vUv = uv;
        gl_Position = camera.projectionMatrix * transform.modelViewMatrix * worldPosition;
    }
`;

const fs = (maxDirectionalLights: number) => glsl300({
    in: vs.config.out,
    out: [{ name: 'fragColor', type: 'vec4' }],
})`
    ${cameraUniforms}

    struct DirLight {
        vec3 direction;
        vec3 diffuseColor;
        vec3 specularColor;
    };

    uniform LightUniforms {
        DirLight dirLights[${maxDirectionalLights}];
    } lights;

    ${materialUniforms}

    uniform sampler2D diffuseMap;

    vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir, vec3 diffuseTexel, vec3 specularTexel) {
        vec3 direction = normalize(light.direction);
        float diff = max(dot(normal, direction), 0.0);
        vec3 reflectDir = reflect(-direction, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.specularExponent);
        vec3 ambient  = diffuseTexel * material.ambientIntensity;
        vec3 diffuse  = light.diffuseColor * diff * diffuseTexel;
        vec3 specular = light.specularColor * spec * specularTexel;
        return ambient + diffuse + specular;
    }

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(camera.translation - vPosition);
        vec3 result = vec3(0.0, 0.0, 0.0);

        vec3 diffuseTexel = material.diffuseColor;
        if (material.useDiffuseMap > 0) {
            diffuseTexel = texture(diffuseMap, vUv).rgb;
        }

        vec3 specularTexel = material.specularColor;

        for(int i = 0; i < ${maxDirectionalLights}; i++) {
            result += CalcDirLight(lights.dirLights[i], normal, viewDir, diffuseTexel, specularTexel);
        }

        fragColor = vec4(result, 1.0);
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

const getLightsUboConfig = (maxLights: number) => [...new Array(maxLights)].map((_, idx) => idx).reduce((accum, idx) => {
    accum[`LightUniforms.dirLights[${idx}].direction`] = vec3.create();
    accum[`LightUniforms.dirLights[${idx}].diffuseColor`] = vec3.create();
    accum[`LightUniforms.dirLights[${idx}].specularColor`] = vec3.create();
    return accum;
}, {} as UBOConfig);

type CachedLights = {
    ubo: UBO<ReturnType<typeof getLightsUboConfig>>;
    dirLights: Array<DirectionalLight>;
};

const materialUboConfig = {
    'material.ambientIntensity': 0,
    'material.diffuseColor': vec3.create(),
    'material.specularColor': vec3.create(),
    'material.specularExponent': 0,
    'material.opacity': 1,
    'material.useDiffuseMap': 0,
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

export const createRenderSystem = ({ canvas, world, maxDirectionalLights = 3 }: RenderSystemArgs): System => {
    const gl = getWebgl2Context(canvas);

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs.sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs(maxDirectionalLights).sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cameraCache: CachedCamera = {
        ubo: new UBO(gl, 'CameraUniforms', 0, cameraUboConfig).bindToShaderProgram(shaderProgram),
    };

    const lightCache: CachedLights = {
        ubo: new UBO(gl, 'LightUniforms', 1, getLightsUboConfig(maxDirectionalLights)).bindToShaderProgram(shaderProgram),
        dirLights: [],
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
            const directionalLight = action.payload.getComponentByClass(DirectionalLight);
            const transform = action.payload.getComponentByClass(Transform);
            const geometry = action.payload.getComponentByClass(Geometry);
            const phongMaterial = action.payload.getComponentByClass(PhongMaterial);
            if (camera) {
                cameraCache.camera = camera;
            } else if (directionalLight) {
                lightCache.dirLights.push(directionalLight);
            } else if (transform && geometry && phongMaterial) {                
                const vao = createWebgl2VertexArray(gl);

                const positionBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.positions));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.POSITION.location, 3);

                const uvBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.uvs));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.UV.location, 2);

                const normalBuffer = createWebgl2ArrayBuffer(gl, new Float32Array(geometry.data.normals));
                setupWebgl2VertexAttribPointer(gl, GLSL300ATTRIBUTE.NORMAL.location, 3);

                const indexBuffer = createWebgl2ElementArrayBuffer(gl, new Uint32Array(geometry.data.indices));
                const indexCount = geometry.data.indices.length;

                const transformUbo = new UBO(gl, 'TransformUniforms', 2, transformUboConfig).bindToShaderProgram(shaderProgram);
                const materialUbo = new UBO(gl, 'MaterialUniforms', 3, materialUboConfig).bindToShaderProgram(shaderProgram);

                const textures: Array<{update: () => void}> = [];

                if (phongMaterial.data.diffuseMap) {
                    const diffuseMapLocation = gl.getUniformLocation(shaderProgram, 'diffuseMap');
                    const diffuseTexture = createTexture2D(gl, phongMaterial.data.diffuseMap);
                    textures.push({
                        update: () => {
                            gl.activeTexture(gl.TEXTURE0 + 0);
                            gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
                            gl.uniform1i(diffuseMapLocation, 0);
                        },
                    });
                }

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

                        materialUbo.bindBase();
                        if (phongMaterial.data.dirty) {
                            phongMaterial.data.dirty = false;
                            materialUbo
                                .setScalar('material.ambientIntensity', phongMaterial.data.ambientIntensity)
                                .setVec3('material.diffuseColor', phongMaterial.data.diffuseColor)
                                .setVec3('material.specularColor', phongMaterial.data.specularColor)
                                .setScalar('material.specularExponent', phongMaterial.data.specularExponent)
                                .setScalar('material.opacity', phongMaterial.data.opacity)
                                .setScalar('material.useDiffuseMap', phongMaterial.data.diffuseMap ? 1 : 0)
                                .update();
                        }

                        for (let i = 0; i < textures.length; i++) {
                            textures[i].update();
                        }


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

    let lightNeedsUpdate = true;

    return () => {
        if (cameraCache.camera.data.dirty) {
            cameraCache.ubo
                .setVec3('camera.translation', cameraCache.camera.data.translation)
                .setMat4('camera.viewMatrix', cameraCache.camera.data.viewMatrix)
                .setMat4('camera.projectionMatrix', cameraCache.camera.data.projectionMatrix)
                .update();
        }

        for (let i = 0; i < lightCache.dirLights.length; i++) {
            const dirLight = lightCache.dirLights[i];
            if (dirLight.data.dirty) {
                lightNeedsUpdate = true;
                lightCache.ubo
                    .setVec3(`LightUniforms.dirLights[${i}].direction`, dirLight.data.direction)
                    .setVec3(`LightUniforms.dirLights[${i}].diffuseColor`, dirLight.data.diffuseColor)
                    .setVec3(`LightUniforms.dirLights[${i}].specularColor`, dirLight.data.specularColor)
            }
        }

        if (lightNeedsUpdate) {
            lightCache.ubo.update();
            lightNeedsUpdate = false;
        }

        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) cachedItem.update();
        }

        cameraCache.camera.data.dirty = false;

        for (let i = 0; i < lightCache.dirLights.length; i++) {
            lightCache.dirLights[i].data.dirty = false;
        }
    };
};