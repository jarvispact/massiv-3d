import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Transform } from '../components/transform';
import { Entity } from '../core/entity';
import { RenderSystem } from '../core/system';
import { CachedRenderable } from './cached-renderable';
import { WebGL2FrameState } from './webgl-2-frame-state';
import { getWebGL2Context } from './webgl-2-utils';

export class WebGL2RenderSystem extends RenderSystem {
    canvas: HTMLCanvasElement;
    cameraEntity: Entity;
    activeCamera: PerspectiveCamera | OrthographicCamera;
    gl: WebGL2RenderingContext;
    frameState: WebGL2FrameState;
    cachedRenderables: Record<string, CachedRenderable>;

    constructor(canvas: HTMLCanvasElement, cameraEntity: Entity) {
        super();
        this.canvas = canvas;
        this.cameraEntity = cameraEntity;
        this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
        this.gl = getWebGL2Context(canvas);
        this.frameState = new WebGL2FrameState(this.gl);
        this.cachedRenderables = {};

        window.addEventListener('unload', () => {
            Object.keys(this.cachedRenderables).forEach(key => this.cachedRenderables[key].cleanup());
        });
    }

    getCachedRenderable(renderable: Renderable): CachedRenderable {
        if (this.cachedRenderables[renderable.entityId]) return this.cachedRenderables[renderable.entityId];
        console.log('cache renderable');
        const transform = this.world.getComponentByEntityIdAndType(renderable.entityId, Transform);
        const cachedRenderable = new CachedRenderable(this.gl, renderable, transform, this.frameState);
        this.cachedRenderables[renderable.entityId] = cachedRenderable;
        return cachedRenderable;
    }

    render(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderables = this.world.getComponentsByType(Renderable);
        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const cachedRenderable = this.getCachedRenderable(renderable);
            cachedRenderable.render(this.activeCamera);
        }
    }
}