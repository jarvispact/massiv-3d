import { World, Transform, PerspectiveCamera, UpdateTransformSystem, UpdateCameraSystem, Geometry } from '../../src';
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
    new Geometry({
        positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
        indices: [0, 1, 2, 0, 2, 3],
    }),
]);

world.registerSystem(new RotationSystem());
world.registerSystem(new UpdateTransformSystem());
world.registerSystem(new UpdateCameraSystem());

const tick = (now: number): void => {
    world.update(now);
    world.render(now);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);