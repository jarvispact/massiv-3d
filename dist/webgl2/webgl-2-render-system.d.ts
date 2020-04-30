import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Entity } from '../core/entity';
import { RenderSystem } from '../core/system';
import { CachedRenderable } from './cached-renderable';
import { WebGL2FrameState } from './webgl-2-frame-state';
export declare class WebGL2RenderSystem extends RenderSystem {
    canvas: HTMLCanvasElement;
    cameraEntity: Entity;
    activeCamera: PerspectiveCamera | OrthographicCamera;
    gl: WebGL2RenderingContext;
    frameState: WebGL2FrameState;
    cachedRenderables: Record<string, CachedRenderable>;
    constructor(canvas: HTMLCanvasElement, cameraEntity: Entity);
    getCachedRenderable(renderable: Renderable): CachedRenderable;
    render(): void;
}
