
import World from '../core/world';
import CachedRenderable from './cached-renderable';
import Uniform from './uniform';

const WebGL2Renderer = class {
    constructor(canvas, world) {
        this.canvas = canvas;
        this.world = world;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.gl = this.canvas.getContext('webgl2', {
            premultipliedAlpha: false,
            alpha: false,
            powerPreference: 'high-performance',
            antialias: true,
            desynchronized: true,
        });

        this.depthFunc = this.gl.LEQUAL;
        this.blendEquation = this.gl.FUNC_ADD;
        this.blendFuncSFactor = this.gl.SRC_ALPHA;
        this.blendFuncDFactor = this.gl.ONE_MINUS_SRC_ALPHA;

        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.colorMask(true, true, true, false);

        this.gl.depthFunc(this.depthFunc);
        this.gl.blendEquation(this.blendEquation);
        this.gl.blendFunc(this.blendFuncSFactor, this.blendFuncDFactor);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);

        this.perspectiveCameras = [];
        this.orthographicCameras = [];
        this.directionalLights = [];
        this.cachedRenderables = [];
        this.activeCamera = null;

        this.uniformUpdateLookupTable = Uniform.createUniformUpdateLookupTable();

        world.on(World.EVENT.REGISTER_ENTITY, (entity) => {
            const renderable = entity.getComponentByType('Renderable');
            const transform = entity.getComponentByType('Transform');
            if (renderable && transform) {
                this.cachedRenderables.push(new CachedRenderable(this.gl, entity.id, renderable, transform, this.uniformUpdateLookupTable));
            }

            const perspectiveCamera = entity.getComponentByType('PerspectiveCamera');
            if (perspectiveCamera) {
                this.perspectiveCameras.push(perspectiveCamera);
                this.activeCamera = perspectiveCamera;
            }

            const orthographicCamera = entity.getComponentByType('OrthographicCamera');
            if (orthographicCamera) {
                this.orthographicCameras.push(orthographicCamera);
                this.activeCamera = orthographicCamera;
            }

            const dirLight = entity.getComponentByType('DirectionalLight');
            if (dirLight) {
                this.directionalLights.push(dirLight);
            }
        });

        world.on(World.EVENT.REMOVE_ENTITY, (entity) => {
            const renderable = entity.getComponentByType('Renderable');
            const transform = entity.getComponentByType('Transform');
            if (renderable && transform) {
                const renderableToRemove = this.cachedRenderables.find(r => r.id === entity.id);
                console.log('cleanup');
                renderableToRemove.cleanup();
                this.cachedRenderables = this.cachedRenderables.filter(r => r !== renderableToRemove);
            }

            const perspectiveCamera = entity.getComponentByType('PerspectiveCamera');
            if (perspectiveCamera) {
                this.perspectiveCameras = this.perspectiveCameras.filter(c => c !== perspectiveCamera);
                if (this.activeCamera === perspectiveCamera) {
                    const lastPerspectiveCamera = this.perspectiveCameras[this.perspectiveCameras.length - 1];
                    const lastOrthographicCamera = this.orthographicCameras[this.orthographicCameras.length - 1];
                    this.activeCamera = lastPerspectiveCamera || lastOrthographicCamera;
                }
            }

            const orthographicCamera = entity.getComponentByType('OrthographicCamera');
            if (orthographicCamera) {
                this.orthographicCameras = this.orthographicCameras.filter(c => c !== orthographicCamera);
                if (this.activeCamera === orthographicCamera) {
                    const lastPerspectiveCamera = this.perspectiveCameras[this.perspectiveCameras.length - 1];
                    const lastOrthographicCamera = this.orthographicCameras[this.orthographicCameras.length - 1];
                    this.activeCamera = lastPerspectiveCamera || lastOrthographicCamera;
                }
            }

            const dirLight = entity.getComponentByType('DirectionalLight');
            if (dirLight) {
                this.directionalLights = this.directionalLights.filter(l => l !== dirLight);
            }
        });

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

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderableCount = this.cachedRenderables.length;

        // render non-transparent renderables
        this.gl.disable(this.gl.BLEND);
        for (let i = 0; i < renderableCount; i++) {
            const cachedRenderable = this.cachedRenderables[i];
            if (cachedRenderable.renderable.material.opacity >= 1) {
                cachedRenderable.render(this.activeCamera, this.directionalLights);
            }
        }

        // render transparent renderables
        this.gl.enable(this.gl.BLEND);
        for (let i = 0; i < renderableCount; i++) {
            const cachedRenderable = this.cachedRenderables[i];
            if (cachedRenderable.renderable.material.opacity < 1) {
                cachedRenderable.render(this.activeCamera, this.directionalLights);
            }
        }

        this.uniformUpdateLookupTable.markFrameAsUpdated(this.activeCamera, this.directionalLights);
    }
};

export default WebGL2Renderer;
