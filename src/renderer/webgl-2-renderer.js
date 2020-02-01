/* eslint-disable no-console, no-bitwise, prefer-destructuring */
import ComponentTypes from '../components/component-types';
import CachedRenderable from './cached-renderable';

const {
    STANDARD_MATERIAL,
    TRANSFORM_3D,
    GEOMETRY,
    PERSPECTIVE_CAMERA,
    ORTHOGRAPHIC_CAMERA,
    DIRECTIONAL_LIGHT,
} = ComponentTypes;

const getRenderablesForStandardMaterial = (world) => {
    const materials = world.getComponentsByType(STANDARD_MATERIAL);

    let i = 0;
    const iMax = materials.length;
    const result = [];

    for (; i < iMax; i++) {
        const material = materials[i];
        result.push({
            id: material.entityId,
            material,
            transform: world.getComponentsByEntityId(material.entityId).find(c => c.type === TRANSFORM_3D),
            geometry: world.getComponentsByEntityId(material.entityId).find(c => c.type === GEOMETRY),
        });
    }

    return result;
};

const getActiveCamera = (world) => {
    const perspectiveCamera = world.getComponentsByType(PERSPECTIVE_CAMERA)[0];
    const orthographicCamera = world.getComponentsByType(ORTHOGRAPHIC_CAMERA)[0];
    return perspectiveCamera || orthographicCamera;
};

const getDirectionalLights = (world) => {
    const dirLights = world.getComponentsByType(DIRECTIONAL_LIGHT);
    return dirLights;
};

const renderableNeedsCacheUpdate = (cachedRenderable, newRenderable) => {
    if (!cachedRenderable) return true;
    if (cachedRenderable.renderable.material !== newRenderable.material) return true;
    if (cachedRenderable.renderable.transform !== newRenderable.transform) return true;
    if (cachedRenderable.renderable.geometry !== newRenderable.geometry) return true;
    return false;
};

const cache = {};

const getCachedRenderable = (gl, renderable) => {
    const cachedRenderable = cache[renderable.id];
    if (cachedRenderable === undefined || renderableNeedsCacheUpdate(cachedRenderable, renderable)) {
        console.log('renderable cache update');
        const newCachedRenderable = new CachedRenderable(gl, renderable);
        cache[renderable.id] = newCachedRenderable;
        return newCachedRenderable;
    }
    return cachedRenderable;
};

class TestRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.gl = this.canvas.getContext('webgl2');
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);
    }

    resize() {
        const c = this.gl.canvas;
        const w = c.clientWidth;
        const h = c.clientHeight;

        if (c.width !== w || c.height !== h) {
            c.width = w;
            c.height = h;
            this.gl.viewport(0, 0, c.width, c.height);
        }
    }

    render(world) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderables = getRenderablesForStandardMaterial(world);
        const activeCamera = getActiveCamera(world);
        const directionalLights = getDirectionalLights(world);

        let i = 0;
        const iMax = renderables.length;

        for (; i < iMax; i++) {
            const renderable = renderables[i];
            const cachedRenderable = getCachedRenderable(this.gl, renderable);
            cachedRenderable.use();
            cachedRenderable.update(renderable, activeCamera, directionalLights);
            cachedRenderable.draw();
        }
    }
}

export default TestRenderer;
