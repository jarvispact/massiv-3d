import { RenderSystem } from '../core/system';
import { getWebGL2Context, WebGL2Options, WebGLContextAttributeOptions } from './webgl-2-utils';
import { CachedRenderable } from './cached-renderable';
import { Renderable } from '../components/renderable';
import { Entity } from '../core/entity';
import { FrameState } from './frame-state';
import { PerspectiveCamera } from '../components/perspective-camera';
import { OrthographicCamera } from '../components/orthographic-camera';
import { Transform } from '../components/transform';
import { ResizeCanvasEvent } from '../events/resize-canvas-event';

type WebGL2RendererOptions = {
    contextAttributeOptions?: Partial<WebGLContextAttributeOptions>;
    getWebGL2Options?: (gl: WebGL2RenderingContext) => Partial<WebGL2Options>;
    autoClear?: boolean;
};

const defaultOptions: WebGL2RendererOptions = {
    autoClear: true,
};

export class WebGL2RenderSystem extends RenderSystem {
    canvas: HTMLCanvasElement;
    cameraEntity: Entity;
    activeCamera: PerspectiveCamera | OrthographicCamera;
    options: WebGL2RendererOptions;
    gl: WebGL2RenderingContext;
    frameState: FrameState;
    cachedRenderables: Record<string, CachedRenderable>;

    constructor(canvas: HTMLCanvasElement, cameraEntity: Entity, options: WebGL2RendererOptions = {}) {
        super();
        this.canvas = canvas;
        this.cameraEntity = cameraEntity;
        this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
        this.options = { ...defaultOptions, ...options };
        this.gl = getWebGL2Context(canvas, options.contextAttributeOptions, options.getWebGL2Options);
        this.frameState = new FrameState(this.gl);
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

        if (this.activeCamera.type === 'PerspectiveCamera') {
            this.activeCamera.setAspect(this.canvas.width / this.canvas.height);
        }

        this.render();
    }

    setActiveCameraEntity(cameraEntity: Entity): WebGL2RenderSystem {
        this.cameraEntity = cameraEntity;
        this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
        return this;
    }

    getCachedRenderable(renderable: Renderable, transform: Transform): CachedRenderable {
        if (this.cachedRenderables[renderable.entityId]) return this.cachedRenderables[renderable.entityId];
        const cachedRenderable = new CachedRenderable(this.gl, renderable, transform, this.frameState);
        this.cachedRenderables[renderable.entityId] = cachedRenderable;
        return cachedRenderable;
    }

    render(): void {
        const gl = this.gl;
        const options = this.options;
        const frameState = this.frameState;
        const activeCamera = this.activeCamera;

        if (options.autoClear) gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        frameState.setBlendEnabled(false);
        frameState.setCullFaceEnabled(false);
        
        const renderables = this.world.getComponentsByType(Renderable);
        const renderablesCount = renderables.length;

        for (let i = 0; i < renderablesCount; i++) {
            const renderable = renderables[i];
            const transform = this.world.getComponentByEntityIdAndType(renderable.entityId, Transform);
            const cachedRenderable = this.getCachedRenderable(renderable, transform);
            cachedRenderable.render(activeCamera);
        }
    }
}