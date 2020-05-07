import { PerspectiveCamera, Renderable, Transform, UnlitMaterial, WebGL2RenderSystem, World, QuadGeometry, System, ResizeCanvasEvent } from '../lib/massiv-3d.esm.js';

class RotationSystem extends System {
    update(delta) {
        this.world.getComponentsByType(Transform).forEach(t => t.rotate(0, 15 * delta, 0));
    }
}

const canvas = document.getElementById('canvas');
canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;

const world = new World();

const camera = world.registerEntity([new PerspectiveCamera({ translation: [0, 0, 2], aspect: canvas.width / canvas.height })]);
world.registerEntity([new Transform(), new Renderable({ material: new UnlitMaterial(), geometry: new QuadGeometry() })]);

world.registerSystem(new RotationSystem());
world.registerRenderSystem(new WebGL2RenderSystem(canvas, camera));

const tick = (now) => {
    world.update(now);
    world.render(now);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);

window.addEventListener('resize', () => {
    world.publish(new ResizeCanvasEvent({ width: canvas.clientWidth, height: canvas.clientHeight }));
});