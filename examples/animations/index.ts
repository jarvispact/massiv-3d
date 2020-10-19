import { glMatrix } from 'gl-matrix';
import { Entity, getWebgl2Context, KeyboardInput, World } from '../../src';
import { createPerspectiveCamera } from '../camera';
import { runGameLoop } from '../game-loop';
import { createAnimationSystem } from './animation-system';
import { Geometry } from './geometry';
import { createRenderSystem } from './render-system';
import { Transform } from './transform';

glMatrix.setMatrixArrayType(Array);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = getWebgl2Context(canvas);

const world = new World();
const camera = createPerspectiveCamera(gl, [0, 0, 3], canvas.width / canvas.height);

const quad1 = new Entity('Quad1', [
    new Transform({ translation: [-1, 0, 0] }),
    new Geometry(),
]);

const quad2 = new Entity('Quad2', [
    new Transform({ translation: [1, 0, 0] }),
    new Geometry(),
]);

const keyboardInput = new KeyboardInput(canvas);
const animationSystem = createAnimationSystem(keyboardInput, world);

const renderSystem = createRenderSystem(gl, world, {
    onCacheEntity: (shaderProgram) => camera.bindToShaderProgram(shaderProgram),
});

world.addEntity(quad1);
world.addEntity(quad2);
world.addSystem(animationSystem);
world.addSystem(renderSystem);

window.addEventListener('resize', () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.setAspect(canvas.width / canvas.height);
});

runGameLoop(world);
