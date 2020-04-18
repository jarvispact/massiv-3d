import { Transform } from '../components/transform';
import { PerspectiveCamera } from '../components/perspective-camera';
import { OrthographicCamera } from '../components/orthographic-camera';
import { Renderable } from '../components/renderable';
import { FrameState } from './frame-state';
import { createShader, createProgram, createVertexArray, createArrayBuffer, createElementArrayBuffer } from './webgl-2-utils';
import { mat4 } from 'gl-matrix';

const vShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = 0) in vec3 position;

    uniform mat4 mvp;

    void main() {
        gl_Position = mvp * vec4(position, 1.0);
    }
`.trim();

const fShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    out vec4 fragmentColor;

    void main() {
        fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`.trim();

export class CachedRenderable {
    gl: WebGL2RenderingContext;
    renderable: Renderable;
    transform: Transform;
    frameState: FrameState;

    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    buffers: WebGLBuffer[];
    indexBuffer: WebGLBuffer;

    mvpLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext, renderable: Renderable, transform: Transform, frameState: FrameState) {
        this.gl = gl;
        this.renderable = renderable;
        this.transform = transform;
        this.frameState = frameState;

        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);

        const [vao, buffers] = createVertexArray(gl, () => {
            const positionBuffer = createArrayBuffer(gl, Float32Array.from(renderable.data.geometry.positions), 0, 3);
            return [positionBuffer];
        });

        this.vao = vao;
        this.buffers = buffers;
        this.indexBuffer = createElementArrayBuffer(gl, Uint32Array.from(renderable.data.geometry.indices));

        this.mvpLocation = gl.getUniformLocation(this.program, 'mvp') as WebGLUniformLocation;
    }

    render(camera: PerspectiveCamera | OrthographicCamera): void {
        const gl = this.gl;
        const frameState = this.frameState;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        mat4.multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, this.transform.data.modelMatrix);
        mat4.multiply(frameState.matrixCache.modelViewProjection, camera.data.projectionMatrix, frameState.matrixCache.modelView);
        gl.uniformMatrix4fv(this.mvpLocation, false, frameState.matrixCache.modelViewProjection);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.renderable.data.geometry.indices.length, gl.UNSIGNED_INT, 0);
    }

    cleanup(): void {
        const gl = this.gl;
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        gl.deleteProgram(this.program);
        this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.indexBuffer);
    }
}