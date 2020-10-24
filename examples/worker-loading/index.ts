import { glMatrix } from 'gl-matrix';
import { Entity, getWebgl2Context, MouseInput, World } from '../../src';
import { createPerspectiveCamera } from '../camera';
import { runGameLoop } from '../game-loop';
import { Geometry } from './geometry';
import { createRenderSystem } from './render-system';
import { createTrackballCameraSystem } from './trackball-camera-system';
import { Transform } from './transform';

glMatrix.setMatrixArrayType(Array);

const start = Date.now();

const world = new World();

const worker = new Worker('./worker.bundle.js');

worker.onmessage = (event: WorkerEventMap['message']) => {
    const sab = event.data.buffer;
    const positions = new Float32Array(sab, event.data.positions.offset, event.data.positions.length);
    const normals = new Float32Array(sab, event.data.normals.offset, event.data.normals.length);
    const uvs = new Float32Array(sab, event.data.uvs.offset, event.data.uvs.length);
    const indices = new Uint32Array(sab, event.data.indices.offset, event.data.indices.length);

    const earth = new Entity('Test', [
        new Transform({ translation: [-20, 0, 0] }),
        new Geometry({ positions, normals, uvs, indices }),
    ]);

    world.addEntity(earth);
    const end = Date.now();
    console.log('finish: ', (end - start) / 1000);
};

worker.postMessage('load-models');

const worker2 = new Worker('./worker2.bundle.js');

worker2.onmessage = (event: WorkerEventMap['message']) => {
    const sab = event.data.buffer;
    const positions = new Float32Array(sab, event.data.positions.offset, event.data.positions.length);
    const normals = new Float32Array(sab, event.data.normals.offset, event.data.normals.length);
    const uvs = new Float32Array(sab, event.data.uvs.offset, event.data.uvs.length);
    const indices = new Uint32Array(sab, event.data.indices.offset, event.data.indices.length);

    const earth = new Entity('Test2', [
        new Transform({ translation: [20, 0, 0] }),
        new Geometry({ positions, normals, uvs, indices }),
    ]);

    world.addEntity(earth);
    const end = Date.now();
    console.log('finish: ', (end - start) / 1000);
};

worker2.postMessage('load-models');

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouseInput = new MouseInput(canvas);

const gl = getWebgl2Context(canvas);

const camera = createPerspectiveCamera(gl, [0, 50, 200], canvas.width / canvas.height);

const renderSystem = createRenderSystem(gl, world, {
    onCacheEntity: (shaderProgram) => camera.bindToShaderProgram(shaderProgram),
});

world.addSystem(renderSystem);
world.addSystem(createTrackballCameraSystem(camera, mouseInput));

window.addEventListener('resize', () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.setAspect(canvas.width / canvas.height);
});

runGameLoop(world);
