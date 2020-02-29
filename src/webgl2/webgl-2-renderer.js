import CachedRenderable from './cached-renderable';
import WebGL2Utils from './webgl-2-utils';
import GlobalWebGL2State from './global-webgl-2-state';

const WebGL2Renderer = class {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.gl = this.canvas.getContext('webgl2', {
            premultipliedAlpha: false,
            alpha: false,
            powerPreference: 'high-performance',
            antialias: true,
            desynchronized: true,
        });

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.colorMask(true, true, true, false);

        this.globalWebglState = new GlobalWebGL2State(this.gl);
        this.webglUniformTypeToUniformType = WebGL2Utils.createUniformTypeLookupTable(this.gl);
        this.renderableCache = {};

        window.addEventListener('unload', () => {
            Object.keys(this.renderableCache).forEach((id) => {
                this.renderableCache[id].cleanup();
            });
        });
    }

    resize() {
        const c = this.gl.canvas;
        const w = c.clientWidth;
        const h = c.clientHeight;
        c.width = w;
        c.height = h;
        this.gl.viewport(0, 0, c.width, c.height);
    }

    cacheRenderable2D(camera, dirLights, transform, renderable) {
        const cachedRenderable = new CachedRenderable(
            this.gl,
            camera,
            dirLights,
            transform,
            renderable,
            this.globalWebglState,
            this.webglUniformTypeToUniformType,
        );

        this.renderableCache[renderable.entityId] = cachedRenderable;
        return cachedRenderable;
    }

    render(world) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const camera = world.getComponentByType('Camera');
        const dirLights = world.getComponentsByType('DirectionalLight');

        const renderables = world.getComponentsByType('Renderable');
        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const transform = world.getComponentsByEntityId(renderable.entityId).find(c => c.constructor.name === 'Transform');
            const cachedRenderable = this.renderableCache[renderable.entityId] || this.cacheRenderable2D(camera, dirLights, transform, renderable);
            cachedRenderable.draw(dirLights);
        }

        Object.keys(camera.getUniformUpdateFlags()).forEach((name) => {
            camera.setUniformUpdateFlag(name, false);
        });

        dirLights.forEach(light => {
            Object.keys(light.getUniformUpdateFlags()).forEach((name) => {
                light.setUniformUpdateFlag(name, false);
            });
        });
    }
};

export default WebGL2Renderer;
