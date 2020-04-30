import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Transform } from '../components/transform';
import { GeometryData } from '../geometry/geometry';
import { WebGL2FrameState } from './webgl-2-frame-state';
import { ActiveUniform } from './webgl-2-utils';
export declare class CachedRenderable {
    gl: WebGL2RenderingContext;
    renderable: Renderable;
    transform: Transform;
    frameState: WebGL2FrameState;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    buffers: WebGLBuffer[];
    geometryData: GeometryData;
    indexBuffer: WebGLBuffer | null;
    activeUniforms: ActiveUniform[];
    constructor(gl: WebGL2RenderingContext, renderable: Renderable, transform: Transform, frameState: WebGL2FrameState);
    render(camera: PerspectiveCamera | OrthographicCamera): void;
    cleanup(): void;
}
