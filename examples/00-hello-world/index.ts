import { World, PerspectiveCamera } from '../../src';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


const world = new World();

const cameraEntity = world.registerEntity([
    new PerspectiveCamera({ position: [0, 3, 5], aspect: canvas.width / canvas.height }),
]);

world.setActiveCameraEntity(cameraEntity);
