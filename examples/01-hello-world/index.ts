import { Entity, FileLoader, Geometry, ParsedObjPrimitive, parseMtlFile, parseObjFile, PerspectiveCamera, Transform } from '../../src';
import { Color } from './components/color';
import { Translation } from './components/translation';
import { createCameraControlSystem } from './systems/camera-control-system';
import { createWebgl2RenderingSystem } from './systems/webgl-2-rendering-system';
import { world } from './world';

(async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cameraEntity = new Entity('Camera', [
        new PerspectiveCamera({ translation: [0, 0, 10], aspect: canvas.width / canvas.height }),
    ]);

    const lightEntity1 = new Entity('Light1', [
        new Translation(3, 5, 5),
        new Color(1, 0, 0),
    ]);

    const lightEntity2 = new Entity('Light2', [
        new Translation(-3, 5, 5),
        new Color(0, 1, 0),
    ]);

    const materials = await FileLoader.load('./assets/hello-world.mtl').then(parseMtlFile);
    const objects = await FileLoader.load('./assets/hello-world.obj').then(fileContent => parseObjFile(fileContent, materials));

    const torus = objects.find(o => o.name === 'Torus') as ParsedObjPrimitive;
    const suzanne = objects.find(o => o.name === 'Suzanne') as ParsedObjPrimitive;
    const sphere = objects.find(o => o.name === 'Sphere') as ParsedObjPrimitive;

    const torusEntity = new Entity('Torus', [
        new Transform(),
        new Geometry(torus),
    ]);

    const suzanneEntity = new Entity('Suzanne', [
        new Transform(),
        new Geometry(suzanne),
    ]);

    const sphereEntity = new Entity('Sphere', [
        new Transform(),
        new Geometry(sphere),
    ]);

    world.addSystem(createCameraControlSystem(canvas));
    world.addSystem(createWebgl2RenderingSystem({ canvas }));

    world.addEntity(cameraEntity);
    world.addEntity(lightEntity1);
    world.addEntity(lightEntity2);
    world.addEntity(torusEntity);
    world.addEntity(suzanneEntity);
    world.addEntity(sphereEntity);

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
