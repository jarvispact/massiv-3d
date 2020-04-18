import { Transform } from '../components/transform';
import { PerspectiveCamera } from '../components/perspective-camera';
import { OrthographicCamera } from '../components/orthographic-camera';
import { Renderable } from '../components/renderable';
import { FrameState } from './frame-state';
export declare class CachedRenderable {
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
    constructor(gl: WebGL2RenderingContext, renderable: Renderable, transform: Transform, frameState: FrameState);
    render(camera: PerspectiveCamera | OrthographicCamera): void;
    cleanup(): void;
}
