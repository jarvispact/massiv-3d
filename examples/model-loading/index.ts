import { glMatrix } from 'gl-matrix';
import { Entity, FileLoader, getWebgl2Context, MouseInput, parseMtlFile, parseObjFile, World } from '../../src';
import { createPerspectiveCamera } from '../camera';
import { runGameLoop } from '../game-loop';
import { Geometry } from './geometry';
import { Material } from './material';
import { createRenderSystem } from './render-system';
import { createTrackballCameraSystem } from './trackball-camera-system';
import { Transform } from './transform';

glMatrix.setMatrixArrayType(Array);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouseInput = new MouseInput(canvas);

const gl = getWebgl2Context(canvas);

const world = new World();
const camera = createPerspectiveCamera(gl, [0, 0, 5], canvas.width / canvas.height);

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

(async () => {
    const [objFileContent, mtlFileContent] = await Promise.all([
        FileLoader.load('./cube_with_multi_material.obj'),
        FileLoader.load('./cube_with_multi_material.mtl'),
    ]);

    const materials = parseMtlFile(mtlFileContent);
    const primitives = parseObjFile(objFileContent, materials);
    console.log({ materials, primitives });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const color1 = materials.find((_, idx) => idx === primitives[0].materialIndex)!.diffuseColor;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const color2 = materials.find((_, idx) => idx === primitives[1].materialIndex)!.diffuseColor;
    

    const earth = new Entity('Earth', [
        new Transform({ translation: [0, 0, 0] }),
        new Material({ color: color1 }),
        new Geometry(primitives[0]),
    ]);

    const earth2 = new Entity('Earth2', [
      new Transform({ translation: [0, 0, 0] }),
      new Material({ color: color2 }),
      new Geometry(primitives[1]),
  ]);

    world.addEntity(earth);
    world.addEntity(earth2);
    runGameLoop(world);
})();
