import { World, Transform, PerspectiveCamera, createShader, createProgram, createVertexArray, createArrayBuffer, createElementArrayBuffer, OrthographicCamera, getWebGL2Context, RenderSystem } from '../../src';
import Renderable from './renderable';
import { mat4 } from 'gl-matrix';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

export const gl = getWebGL2Context(canvas);

const vShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = 0) in vec3 position;
    layout(location = 1) in vec2 uv;

    uniform mat4 mvp;

    out vec2 aUv;

    void main() {
        aUv = uv;
        gl_Position = mvp * vec4(position, 1.0);
    }
`.trim();

const fShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    uniform sampler2D diffuseMap;

    in vec2 aUv;

    out vec4 fragmentColor;

    void main() {
        fragmentColor = vec4(texture(diffuseMap, aUv).rgb, 1.0);
    }
`.trim();

interface CachedRenderable {
    renderable: Renderable;
    transform: Transform;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    buffers: WebGLBuffer[];
    indices: WebGLBuffer;
    uniforms: Record<string, { location: WebGLUniformLocation | null; value: unknown }>;
    textures: { name: string; location: WebGLUniformLocation | null; value: unknown }[];
    update(camera: PerspectiveCamera | OrthographicCamera): void;
    cleanup(): void;
}

const CachedRenderable = class implements CachedRenderable {
    renderable: Renderable;
    transform: Transform;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    buffers: WebGLBuffer[];
    indices: WebGLBuffer;
    uniforms: Record<string, { location: WebGLUniformLocation | null; value: unknown }>;
    textures: { name: string; location: WebGLUniformLocation | null; value: unknown }[];

    constructor(renderable: Renderable, transform: Transform) {
        this.renderable = renderable;
        this.transform = transform;

        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);

        const [vao, buffers] = createVertexArray(gl, () => {
            const positionBuffer = createArrayBuffer(gl, Float32Array.from(renderable.data.positions), 0, 3);
            const uvBuffer = createArrayBuffer(gl, Float32Array.from(renderable.data.uvs), 1, 2);
            return [positionBuffer, uvBuffer];
        });

        this.vao = vao;
        this.buffers = buffers;
        this.indices = createElementArrayBuffer(gl, Uint32Array.from(renderable.data.indices));

        this.uniforms = {
            mvp: { location: gl.getUniformLocation(this.program, 'mvp'), value: mat4.create() },
        };

        this.textures = [
            { name: 'diffuseMap', location: gl.getUniformLocation(this.program, 'diffuseMap'), value: renderable.data.diffuseMap },
        ];
    }

    update(camera: PerspectiveCamera | OrthographicCamera): void {
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        camera.update();
        mat4.multiply(this.uniforms.mvp.value as mat4, camera.data.viewMatrix, this.transform.data.modelMatrix);
        mat4.multiply(this.uniforms.mvp.value as mat4, camera.data.projectionMatrix, this.uniforms.mvp.value as mat4);
        gl.uniformMatrix4fv(this.uniforms.mvp.location, false, this.uniforms.mvp.value as mat4);

        for (let i = 0; i < this.textures.length; i++) {
            const texture = this.textures[i];
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, texture.value as WebGLTexture);
            gl.uniform1i(texture.location, i);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
        gl.drawElements(gl.TRIANGLES, this.renderable.data.indices.length, gl.UNSIGNED_INT, 0);
    }

    cleanup(): void {
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        gl.deleteProgram(this.program);
        this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.indices);
    }
}

export class CustomRenderSystem extends RenderSystem {
    renderableCache: Record<string, CachedRenderable> = {};

    constructor(world: World) {
        super(world)
        window.addEventListener('unload', () => {
            Object.keys(this.renderableCache).forEach(key => this.renderableCache[key].cleanup());
        });
    }

    getCachedRenderable(renderable: Renderable, transform: Transform): CachedRenderable {
        console.log('new cached renderable');
        const cachedRenderable = new CachedRenderable(renderable, transform);
        this.renderableCache[renderable.entityId] = cachedRenderable;
        return cachedRenderable;
    }

    render(): void {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const camera = this.world.getComponentsByType(PerspectiveCamera)[0];
        const renderables = this.world.getComponentsByType(Renderable);

        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const transform = this.world.getComponentByEntityIdAndType(renderable.entityId, Transform);
            const cachedRenderable = this.renderableCache[renderable.entityId] || this.getCachedRenderable(renderable, transform);
            cachedRenderable.update(camera);
        }
    }
}