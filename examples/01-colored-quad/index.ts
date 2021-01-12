import { createObjFileParser, Entity, FileLoader, parseMtlFile, World } from '../../src';
import { Geometry } from './components/geometry';
import { createRenderSystem } from './systems/render-system';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const world = new World();

world.addSystem(createRenderSystem({ canvas, world }));

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

const test = async () => {
    const roadPaths = ['./assets/road_straight', './assets/road_curve', './assets/road_intersection', './assets/road_crossing'];

    const mtlPaths = roadPaths.map((p) => `${p}.mtl`);
    const objPaths = roadPaths.map((p) => `${p}.obj`);

    const parsedMaterials = await Promise.all(mtlPaths.map((path) => FileLoader.load(path).then(parseMtlFile)));
    console.log({ parsedMaterials });

    const parseObjFile = createObjFileParser({ splitObjectMode: 'group' });
    const parsedPrimitives = await Promise.all(objPaths.map((path) => FileLoader.load(path).then(parseObjFile)));

    console.log({ parsedPrimitives });
};

test();
