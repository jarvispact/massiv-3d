import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Entity } from '../core/entity';
import { RenderSystem } from '../core/system';
import { CachedRenderable } from './cached-renderable';
import { WebGL2FrameState } from './webgl-2-frame-state';
import { WebGLContextAttributeOptions, WebGL2Options } from './webgl-2-utils';
import { ResizeCanvasEvent } from '../events/resize-canvas-event';
export declare type WebGL2RenderSystemOptions = {
    contextAttributeOptions?: Partial<WebGLContextAttributeOptions>;
    getWebgl2Options?(gl: WebGL2RenderingContext): Partial<WebGL2Options>;
    autoClear?: boolean;
};
export declare class WebGL2RenderSystem extends RenderSystem {
    canvas: HTMLCanvasElement;
    cameraEntity: Entity;
    options: WebGL2RenderSystemOptions;
    activeCamera: PerspectiveCamera | OrthographicCamera;
    gl: WebGL2RenderingContext;
    frameState: WebGL2FrameState;
    cachedRenderables: Record<string, CachedRenderable>;
    constructor(canvas: HTMLCanvasElement, cameraEntity: Entity, options?: WebGL2RenderSystemOptions);
    init(): void;
    on(event: ResizeCanvasEvent): void;
    getCachedRenderable(renderable: Renderable): CachedRenderable;
    render(): void;
}
