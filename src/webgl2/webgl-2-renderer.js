/* eslint-disable max-classes-per-file */

import CachedRenderable from './cached-renderable';
import Transform from '../components/transform';
import WebGL2Utils from './webgl-2-utils';

const GlobalWebGLState = class {
    constructor(gl) {
        this.gl = gl;
        this.depthTestEnabled = true;
        this.depthFunc = gl.LEQUAL;

        this.blendEnabled = false;
        this.blendEquation = gl.FUNC_ADD;
        this.blendFuncSFactor = gl.SRC_ALPHA;
        this.blendFuncDFactor = gl.ONE_MINUS_SRC_ALPHA;

        gl.depthFunc(this.depthFunc);
        gl.blendEquation(this.blendEquation);
        gl.blendFunc(this.blendFuncSFactor, this.blendFuncDFactor);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }

    setDepthTestEnabled(flag) {
        if (this.depthTestEnabled === flag) return;
        this.depthTestEnabled = flag;
        console.log('setDepthTestEnabled', flag);
        if (flag) {
            this.gl.enable(this.gl.DEPTH_TEST);
        } else {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
    }

    setBlendEnabled(flag) {
        if (this.blendEnabled === flag) return;
        this.blendEnabled = flag;
        console.log('setBlendEnabled', flag);
        if (flag) {
            this.gl.enable(this.gl.BLEND);
        } else {
            this.gl.disable(this.gl.BLEND);
        }
    }
};

const WebGL2Renderer = class {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.gl = this.canvas.getContext('webgl2', {
            premultipliedAlpha: false,
            alpha: false,
        });

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.colorMask(true, true, true, false);

        this.globalWebglState = new GlobalWebGLState(this.gl);
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

        const camera = world.getComponentByType('camera');
        camera.update();

        const dirLights = world.getComponentsByType('dirLight');

        const renderables = world.getComponentsByType('renderable');
        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const transform = world.getComponentsByEntityId(renderable.entityId).find(c => c instanceof Transform);
            const cachedRenderable = this.renderableCache[renderable.entityId] || this.cacheRenderable2D(camera, dirLights, transform, renderable);
            transform.update();
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
