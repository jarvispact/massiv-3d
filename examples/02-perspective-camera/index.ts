import { Entity, World } from '../../src';
import { Geometry } from './components/geometry';
import { PerspectiveCamera } from './components/perspective-camera';
import { createRenderSystem } from './systems/render-system';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const world = new World();

world.addSystem(createRenderSystem({ canvas, world }));

world.addEntity(new Entity('Camera', [
    new PerspectiveCamera({ translation: [0, 0, 2], lookAt: [0, 0, 0], aspect: canvas.width / canvas.height }),
]));

world.addEntity(new Entity('DemoPlane', [
    new Geometry({
        positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
        indices: [0, 1, 2, 0, 2, 3],
        colors: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    }),
]));

const tick = (time: number) => {
    world.update(time);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);
