import { World, Transform, PerspectiveCamera, UnlitMaterial, WebGL2RenderSystem, QuadGeometry, Renderable, UpdateCameraSystem } from '../../src';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const world = new World();

const cameraEntity = world.registerEntity([
    new PerspectiveCamera({ translation: [0, 0, 2], aspect: canvas.width / canvas.height })
]);

world.registerEntity([
    new Transform(),
    new Renderable({ material: new UnlitMaterial(), geometry: new QuadGeometry() }),
]);

world.registerSystem(new UpdateCameraSystem());
world.registerRenderSystem(new WebGL2RenderSystem(canvas, cameraEntity));

window.requestAnimationFrame((now: number) => {
    world.update(now);
    world.render(now);
});