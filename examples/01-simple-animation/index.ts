import { World, Transform, PerspectiveCamera, UnlitMaterial, WebGL2RenderSystem, QuadGeometry, Renderable, UpdateTransformSystem, UpdateCameraSystem } from '../../src';
import Rotation from './rotation';
import RotationSystem from './rotation-system';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const world = new World();

const cameraEntity = world.registerEntity([
    new PerspectiveCamera({ translation: [0, 0, 2], aspect: canvas.width / canvas.height })
]);

world.registerEntity([
    new Transform(),
    new Rotation(),
    new Renderable({ material: new UnlitMaterial(), geometry: new QuadGeometry() }),
]);

world.registerSystem(new RotationSystem());
world.registerSystem(new UpdateTransformSystem());
world.registerSystem(new UpdateCameraSystem());
world.registerRenderSystem(new WebGL2RenderSystem(canvas, cameraEntity));

const tick = (now: number): void => {
    world.update(now);
    world.render(now);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);