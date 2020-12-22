import { DirectionalLight, Entity, FileLoader, Geometry, parseMtlFile, parseObjFile, PerspectiveCamera, PhongMaterial, Transform, ParsedObjPrimitive, ParsedMtlMaterial, KeyboardInput } from '../../src';
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
        new DirectionalLight({ direction: [3, 5, 1] }),
    ]);

    const materials = await FileLoader.load('./assets/hello-world.mtl').then(parseMtlFile);
    const objects = await FileLoader.load('./assets/hello-world.obj').then(fileContent => parseObjFile(fileContent, materials));

    const torus = objects.find(o => o.name === 'Torus') as ParsedObjPrimitive;
    const suzanne = objects.find(o => o.name === 'Suzanne') as ParsedObjPrimitive;
    const sphere = objects.find(o => o.name === 'Sphere') as ParsedObjPrimitive;

    const torusMaterial = materials.find((_, idx) => idx === torus.materialIndex) as ParsedMtlMaterial;
    const suzanneMaterial = materials.find((_, idx) => idx === suzanne.materialIndex) as ParsedMtlMaterial;
    const sphereMaterial = materials.find((_, idx) => idx === sphere.materialIndex) as ParsedMtlMaterial;

    const torusEntity = new Entity('Torus', [
        new Transform(),
        new Geometry(torus),
        new PhongMaterial(torusMaterial),
    ]);

    const suzanneEntity = new Entity('Suzanne', [
        new Transform(),
        new Geometry(suzanne),
        new PhongMaterial(suzanneMaterial),
    ]);

    const sphereEntity = new Entity('Sphere', [
        new Transform(),
        new Geometry(sphere),
        new PhongMaterial(sphereMaterial),
    ]);

    world.addSystem(createCameraControlSystem(canvas));
    world.addSystem(createWebgl2RenderingSystem({ canvas }));

    world.addEntity(cameraEntity);
    world.addEntity(lightEntity1);
    world.addEntity(torusEntity);
    world.addEntity(suzanneEntity);
    world.addEntity(sphereEntity);

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
