import { computeTangents, Entity, FileLoader, ImageLoader, parseObjFile, World } from '../../src';
import { DirectionalLight } from './components/directional-light';
import { Geometry } from './components/geometry';
import { PhongMaterial } from './components/phong-material';
import { PerspectiveCamera } from './components/perspective-camera';
import { Rotation } from './components/rotation';
import { Transform } from './components/transform';
import { createRenderSystem } from './systems/render-system';
import { createRotationSystem } from './systems/rotation-system';

(async () => {
    const [[torus], diffuseMap, specularMap, normalMap] = await Promise.all([
        FileLoader.load('./assets/torus.obj').then(parseObjFile),
        ImageLoader.load('./assets/pavement-diffuse.jpg'),
        ImageLoader.load('./assets/pavement-specular.jpg'),
        ImageLoader.load('./assets/pavement-normal.jpg')
    ]);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const world = new World();
    
    world.addSystem(createRotationSystem({ world }));
    world.addSystem(createRenderSystem({ canvas, world }));

    world.addEntity(new Entity('Camera', [
        new PerspectiveCamera({ translation: [0, 2, 3], lookAt: [0, 0, 0], aspect: canvas.width / canvas.height }),
    ]));

    world.addEntity(new Entity('Light', [
        new DirectionalLight({ direction: [0, 5, 0] }),
    ]));

    world.addEntity(new Entity('DemoTorus', [
        new Transform(),
        new Rotation([0, 15, 0]),
        new Geometry({ ...torus, ...computeTangents(torus.positions, torus.indices, torus.uvs) }),
        new PhongMaterial({ diffuseMap, specularMap, normalMap, uvRepeat: [8, 2], specularExponent: 64 }),
    ]));
    
    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };
    
    window.requestAnimationFrame(tick);
})();
