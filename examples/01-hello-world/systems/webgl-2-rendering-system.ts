import { mat4, vec3 } from 'gl-matrix';
import { createWebgl2ArrayBuffer, createWebgl2ElementArrayBuffer, createWebgl2Program, createWebgl2Shader, createWebgl2VertexArray, DirectionalLight, Geometry, getWebgl2Context, glsl300, PerspectiveCamera, PhongMaterial, setupWebgl2VertexAttribPointer, System, Transform, UBO, UBOConfig } from '../../../src';
import { world } from '../world';

const createVertexShaderSource = () => glsl300({
    attributes: [
        { name: 'position', type: 'vec3', location: 0 },
        { name: 'normal', type: 'vec3', location: 1 },
    ],
    out: [
        { name: 'vNormal', type: 'vec3' },
        { name: 'vPosition', type: 'vec3' },
    ],
})`
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;

    uniform mat4 modelMatrix;

    void main() {
        mat4 modelView = camera.viewMatrix * modelMatrix;
        mat3 normalMatrix = mat3(transpose(inverse(modelView)));
        vNormal = normalMatrix * normal;
        vPosition = vec3(modelMatrix * vec4(position, 1.0));
        gl_Position = camera.projectionMatrix * camera.viewMatrix * modelMatrix * vec4(position, 1.0);
    }
`;

const createFragmentShaderSource = (maxDirLights: number) => glsl300({
    in: [
        { name: 'vNormal', type: 'vec3' },
        { name: 'vPosition', type: 'vec3' },
    ],
    out: [
        { name: 'fragColor', type: 'vec4' }
    ],
})`
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;

    struct DirLight {
        vec3 direction;
        vec3 diffuseColor;
        vec3 specularColor;
    };

    uniform LightUniforms {
        DirLight dirLights[${maxDirLights}];
    } lights;

    struct Material {
        float ambientIntensity;
        vec3 diffuseColor;
        vec3 specularColor;
        float specularExponent;
        float opacity;
    };

    uniform MaterialUniforms {
        Material material;
    };

    vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
        vec3 direction = normalize(light.direction);
        float diff = max(dot(normal, direction), 0.0);
        vec3 reflectDir = reflect(-direction, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.specularExponent);
        vec3 ambient  = material.diffuseColor * material.ambientIntensity;
        vec3 diffuse  = light.diffuseColor * diff * material.diffuseColor;
        vec3 specular = light.specularColor * spec * material.specularColor;
        return ambient + diffuse + specular;
    }

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(camera.translation - vPosition);
        vec3 result = vec3(0.0, 0.0, 0.0);

        for(int i = 0; i < ${maxDirLights}; i++) {
            result += CalcDirLight(lights.dirLights[i], normal, viewDir);
        }

        fragColor = vec4(result, 1.0);
    }
`;

const cameraUboConfig = {
    'CameraUniforms.translation': { data: vec3.create() },
    'CameraUniforms.viewMatrix': { data: mat4.create() },
    'CameraUniforms.projectionMatrix': { data: mat4.create() },
};

type CachedCamera = {
    camera: PerspectiveCamera;
    ubo: UBO<typeof cameraUboConfig>;
};

const getLightsUboConfig = (maxLights: number) => [...new Array(maxLights)].map((_, idx) => idx).reduce((accum, idx) => {
    accum[`LightUniforms.dirLights[${idx}].direction`] = { data: vec3.create() };
    accum[`LightUniforms.dirLights[${idx}].diffuseColor`] = { data: vec3.create() };
    accum[`LightUniforms.dirLights[${idx}].specularColor`] = { data: vec3.create() };
    return accum;
}, {} as UBOConfig);

type CachedLights = {
    ubo: UBO<ReturnType<typeof getLightsUboConfig>>;
    dirLights: Array<DirectionalLight>;
};

const materialUboConfig = {
    'material.ambientIntensity': { data: [0] },
    'material.diffuseColor': { data: vec3.create() },
    'material.specularColor': { data: vec3.create() },
    'material.specularExponent': { data: [0] },
    'material.opacity': { data: [1] },
};

type CachedRenderable = {
    update: () => void;
};

type Webgl2RenderingSystemArgs = {
    canvas: HTMLCanvasElement;
    maxDirectionalLights?: number;
};

export const createWebgl2RenderingSystem = ({ canvas, maxDirectionalLights = 5 }: Webgl2RenderingSystemArgs): System => {
    const gl = getWebgl2Context(canvas);

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, createVertexShaderSource().sourceCode);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, createFragmentShaderSource(maxDirectionalLights).sourceCode);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    const cache: Array<CachedRenderable> = [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cameraCache: CachedCamera = {
        ubo: new UBO(gl, 'CameraUniforms', 0, cameraUboConfig),
    };

    const lightCache: CachedLights = {
        ubo: new UBO(gl, 'LightUniforms', 1, getLightsUboConfig(maxDirectionalLights)),
        dirLights: [],
    };

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const perspectiveCamera = action.payload.getComponentByClass(PerspectiveCamera);
            const directionalLight = action.payload.getComponentByClass(DirectionalLight);
            const transform = action.payload.getComponentByClass(Transform);
            const geometry = action.payload.getComponentByClass(Geometry);
            const phongMaterial = action.payload.getComponentByClass(PhongMaterial);

            if (perspectiveCamera) {
                cameraCache.camera = perspectiveCamera;
            } else if (directionalLight) {
                if (lightCache.dirLights.length > maxDirectionalLights) {
                    throw new Error('you cannot add another DirectionalLight, try to increase the maxDirectionalLights property');
                }

                lightCache.dirLights.push(directionalLight);
            } else if (transform && geometry && phongMaterial) {
                const materialUbo = new UBO(gl, 'MaterialUniforms', 2, materialUboConfig);

                cameraCache.ubo.bindToShaderProgram(shaderProgram);
                lightCache.ubo.bindToShaderProgram(shaderProgram);

                materialUbo.bindToShaderProgram(shaderProgram);

                const vao = createWebgl2VertexArray(gl);
                const positionBuffer = createWebgl2ArrayBuffer(gl, geometry.data.positions);
                setupWebgl2VertexAttribPointer(gl, 0, 3);
                const normalBuffer = createWebgl2ArrayBuffer(gl, geometry.data.normals);
                setupWebgl2VertexAttribPointer(gl, 1, 3);

                const indexBuffer = createWebgl2ElementArrayBuffer(gl, geometry.data.indices);
                const indexCount = geometry.data.indices.length;

                const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
                gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);

                cache.push({
                    update: () => {
                        materialUbo.bindBase();
                        if (phongMaterial.isDirty()) {
                            console.log('material update');
                            phongMaterial.setDirty(false);
                            materialUbo
                                .setView('material.ambientIntensity', [phongMaterial.data.ambientIntensity])
                                .setView('material.diffuseColor', phongMaterial.data.diffuseColor)
                                .setView('material.specularColor', phongMaterial.data.specularColor)
                                .setView('material.specularExponent', [phongMaterial.data.specularExponent])
                                .setView('material.opacity', [phongMaterial.data.opacity])
                                .update();
                        }
                        gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                        gl.bindVertexArray(vao);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
                    },
                });
            }
        }
    });

    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        cameraCache.camera.setAspect(canvas.width / canvas.height);
    });

    let lightNeedsUpdate = true;

    return () => {
        if (cameraCache.camera.isDirty()) {
            console.log('update camera ubo');
            cameraCache.ubo
                .setView('CameraUniforms.translation', cameraCache.camera.data.translation)
                .setView('CameraUniforms.viewMatrix', cameraCache.camera.data.viewMatrix)
                .setView('CameraUniforms.projectionMatrix', cameraCache.camera.data.projectionMatrix)
                .update();
        }

        for (let i = 0; i < lightCache.dirLights.length; i++) {
            const dirLight = lightCache.dirLights[i];
            if (dirLight.isDirty()) {
                console.log(`light ${i} is dirty`);
                lightNeedsUpdate = true;
                lightCache.ubo
                    .setView(`LightUniforms.dirLights[${i}].direction`, dirLight.data.direction)
                    .setView(`LightUniforms.dirLights[${i}].diffuseColor`, dirLight.data.diffuseColor)
                    .setView(`LightUniforms.dirLights[${i}].specularColor`, dirLight.data.specularColor)
            }
        }

        if (lightNeedsUpdate) {
            console.log('update light ubo');
            lightCache.ubo.update();
            lightNeedsUpdate = false;
        }
                
        for (let i = 0; i < cache.length; i++) {
            cache[i].update();
        }

        cameraCache.camera.setDirty(false);

        for (let i = 0; i < lightCache.dirLights.length; i++) {
            lightCache.dirLights[i].setDirty(false);
        }
    };
};