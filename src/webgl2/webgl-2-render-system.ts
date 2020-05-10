import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Transform } from '../components/transform';
import { Entity } from '../core/entity';
import { RenderSystem } from '../core/system';
import { CachedRenderable } from './cached-renderable';
import { WebGL2FrameState } from './webgl-2-frame-state';
import { getWebGL2Context, WebGLContextAttributeOptions, WebGL2Options } from './webgl-2-utils';
import { ResizeCanvasEvent } from '../events/resize-canvas-event';
import { DirectionalLight } from '../components/directional-light';

export type WebGL2RenderSystemOptions = {
    contextAttributeOptions?: Partial<WebGLContextAttributeOptions>;
    getWebgl2Options?(gl: WebGL2RenderingContext): Partial<WebGL2Options>;
    autoClear?: boolean;
};

const defaultRenderSystemOptions: WebGL2RenderSystemOptions = {
    autoClear: true,
};

export class WebGL2RenderSystem extends RenderSystem {
    canvas: HTMLCanvasElement;
    cameraEntity: Entity;
    options: WebGL2RenderSystemOptions;

    activeCamera: PerspectiveCamera | OrthographicCamera;
    gl: WebGL2RenderingContext;
    frameState: WebGL2FrameState;
    cachedRenderables: Record<string, CachedRenderable>;

    constructor(canvas: HTMLCanvasElement, cameraEntity: Entity, options?: WebGL2RenderSystemOptions) {
        super();
        this.canvas = canvas;
        this.cameraEntity = cameraEntity;
        this.options = { ...defaultRenderSystemOptions, ...options };

        this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
        this.gl = getWebGL2Context(canvas, this.options.contextAttributeOptions, this.options.getWebgl2Options);
        this.frameState = new WebGL2FrameState(this.gl);
        this.cachedRenderables = {};

        window.addEventListener('unload', () => {
            Object.keys(this.cachedRenderables).forEach(key => this.cachedRenderables[key].cleanup());
        });
    }

    init(): void {
        this.world.subscribe(this, [ResizeCanvasEvent]);
    }

    on(event: ResizeCanvasEvent): void {
        this.canvas.width = event.payload.width;
        this.canvas.height = event.payload.height;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.render();
    }

    getCachedRenderable(renderable: Renderable): CachedRenderable {
        if (this.cachedRenderables[renderable.entityId]) return this.cachedRenderables[renderable.entityId];
        const transform = this.world.getComponentByEntityIdAndType(renderable.entityId, Transform);
        const cachedRenderable = new CachedRenderable(this.gl, renderable, transform, this.frameState);
        this.cachedRenderables[renderable.entityId] = cachedRenderable;
        return cachedRenderable;
    }

    render(): void {
        if (this.options.autoClear) this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const dirLights = this.world.getComponentsByType(DirectionalLight);
        this.frameState.cacheDirectionalLights(dirLights);

        const renderables = this.world.getComponentsByType(Renderable);
        const renderableCount = renderables.length;

        for (let i = 0; i < renderableCount; i++) {
            const renderable = renderables[i];
            const cachedRenderable = this.getCachedRenderable(renderable);
            cachedRenderable.render(this.activeCamera, dirLights);
        }

        this.activeCamera.resetWebglDirtyFlags();
        for (let i = 0; i < dirLights.length; i++) dirLights[i].resetWebglDirtyFlags();
    }
}