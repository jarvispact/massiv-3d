import { mat4, vec3 } from 'gl-matrix';
import { createWebgl2ArrayBuffer, createWebgl2ElementArrayBuffer, createWebgl2Program, createWebgl2Shader, createWebgl2VertexArray, Geometry, getWebgl2Context, glsl300, PerspectiveCamera, setupWebgl2VertexAttribPointer, System, Transform, UBO, UBOConfig } from '../../../src';
import { Color } from '../components/color';
import { Translation } from '../components/translation';
import { world } from '../world';

const createVertexShaderSource = () => glsl300({
    attributes: [
        { name: 'position', type: 'vec3', location: 0 },
        { name: 'normal', type: 'vec3', location: 1 },
    ],
    out: [
        { name: 'vNormal', type: 'vec3' },
    ],
})`
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;

    uniform mat4 modelMatrix;

    void main() {
        vNormal = normal;
        gl_Position = camera.projectionMatrix * camera.viewMatrix * modelMatrix * vec4(position, 1.0);
    }
`;

const createFragmentShaderSource = (maxLights: number) => glsl300({
    in: [
        { name: 'vNormal', type: 'vec3' },
    ],
    out: [
        { name: 'fragColor', type: 'vec4' }
    ],
})`
    struct Light {
        vec3 translation;
        vec3 color;
    };

    uniform LightUniforms {
        Light lights[${maxLights}];
    };

    void main() {
        fragColor = vec4(normalize(vNormal), 1.0);
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
    accum[`lights[${idx}].translation`] = { data: vec3.create() };
    accum[`lights[${idx}].color`] = { data: vec3.create() };
    return accum;
}, {} as UBOConfig);

type CachedLights = {
    ubo: UBO<ReturnType<typeof getLightsUboConfig>>;
    lights: Array<{translation: vec3; color: vec3}>;
};

type CachedRenderable = {
    update: () => void;
};

type Webgl2RenderingSystemArgs = {
    canvas: HTMLCanvasElement;
    maxLights?: number;
};

export const createWebgl2RenderingSystem = ({ canvas, maxLights = 5 }: Webgl2RenderingSystemArgs): System => {
    const gl = getWebgl2Context(canvas);

    const cache: Array<CachedRenderable> = [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cameraCache: CachedCamera = {
        ubo: new UBO(gl, 'CameraUniforms', 0, cameraUboConfig),
    };

    const lightCache: CachedLights = {
        ubo: new UBO(gl, 'LightUniforms', 1, getLightsUboConfig(maxLights)),
        lights: [],
    };

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const perspectiveCamera = action.payload.getComponentByClass(PerspectiveCamera);
            const translation = action.payload.getComponentByClass(Translation);
            const color = action.payload.getComponentByClass(Color);
            const transform = action.payload.getComponentByClass(Transform);
            const geometry = action.payload.getComponentByClass(Geometry);

            if (perspectiveCamera) {
                cameraCache.camera = perspectiveCamera;
            } else if (translation && color) {
                lightCache.lights.push({ translation: translation.data, color: color.data });
                // lightCache.ubo
                //     .setView(`lights[${lightCache.lights.length - 1}].translation`, translation.data)
                //     .setView(`lights[${lightCache.lights.length - 1}].color`, color.data)
                //     .update();
            } else if (transform && geometry) {
                const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, createVertexShaderSource().sourceCode);
                const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, createFragmentShaderSource(maxLights).sourceCode);
                const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
                gl.useProgram(shaderProgram);
                cameraCache.ubo.bindToShaderProgram(shaderProgram);
                lightCache.ubo.bindToShaderProgram(shaderProgram);

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
                        gl.useProgram(shaderProgram);
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

    return () => {
        if (cameraCache.camera.isDirty()) {
            cameraCache.ubo
                .setView('CameraUniforms.translation', cameraCache.camera.data.translation)
                .setView('CameraUniforms.viewMatrix', cameraCache.camera.data.viewMatrix)
                .setView('CameraUniforms.projectionMatrix', cameraCache.camera.data.projectionMatrix)
                .update();
        }

        for (let i = 0; i < lightCache.lights.length; i++) {
            const l = lightCache.lights[i];
            lightCache.ubo
                .setView(`lights[${i}].translation`, l.translation)
                .setView(`lights[${i}].color`, l.color)
        }

        lightCache.ubo.update();
                
        for (let i = 0; i < cache.length; i++) {
            cache[i].update();
        }

        cameraCache.camera.setDirty(false);
    };
};