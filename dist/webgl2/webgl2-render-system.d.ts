import { RenderSystem } from '../core/system';
import { WebGL2Options, WebGLContextAttributeOptions } from './webgl-2-utils';
import { CachedRenderable } from './cached-renderable';
import { Renderable } from '../components/renderable';
import { Entity } from '../core/entity';
import { FrameState } from './frame-state';
import { PerspectiveCamera } from '../components/perspective-camera';
import { OrthographicCamera } from '../components/orthographic-camera';
import { Transform } from '../components/transform';
import { ResizeCanvasEvent } from '../events/resize-canvas-event';
declare type WebGL2RendererOptions = {
    contextAttributeOptions?: Partial<WebGLContextAttributeOptions>;
    getWebGL2Options?: (gl: WebGL2RenderingContext) => Partial<WebGL2Options>;
    autoClear?: boolean;
};
export declare class WebGL2RenderSystem extends RenderSystem {
    canvas: HTMLCanvasElement;
    cameraEntity: Entity;
    activeCamera: PerspectiveCamera | OrthographicCamera;
    options: WebGL2RendererOptions;
    gl: WebGL2RenderingContext;
    frameState: FrameState;
    cachedRenderables: Record<string, CachedRenderable>;
    constructor(canvas: HTMLCanvasElement, cameraEntity: Entity, options?: WebGL2RendererOptions);
    init(): void;
    on(event: ResizeCanvasEvent): void;
    setActiveCameraEntity(cameraEntity: Entity): WebGL2RenderSystem;
    getCachedRenderable(renderable: Renderable, transform: Transform): CachedRenderable;
    render(): void;
}
export {};
