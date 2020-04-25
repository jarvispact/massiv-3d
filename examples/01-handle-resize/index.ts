import { World, Transform, PerspectiveCamera, UpdateCameraSystem, ResizeCanvasEvent, Geometry } from '../../src';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const world = new World();

const cameraEntity = world.registerEntity([
    new PerspectiveCamera({ translation: [0, 0, 2], aspect: canvas.width / canvas.height })
]);

world.registerEntity([
    new Transform(),
    new Geometry({
        positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
        indices: [0, 1, 2, 0, 2, 3],
    }),
]);

world.registerSystem(new UpdateCameraSystem());

window.requestAnimationFrame((now: number) => {
    world.update(now);
    world.render(now);
});

window.addEventListener('resize', () => {
    world.publish(new ResizeCanvasEvent({ width: canvas.clientWidth, height: canvas.clientHeight }));
});