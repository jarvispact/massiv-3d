import { FileLoader, ImageLoader, parseObjFile, World } from '../../src';
import { Geometry } from './components/geometry';
import { Material } from './components/material';
import { PerspectiveCamera } from './components/perspective-camera';
import { Rotation } from './components/rotation';
import { Transform } from './components/transform';
import { createRenderSystem } from './systems/render-system';
import { createRotationSystem } from './systems/rotation-system';

(async () => {
    const diffuseMap = await ImageLoader.load('./assets/brick-diffuse-map.jpg');
    const [cube] = await FileLoader.load('./assets/textured-cube.obj').then(parseObjFile);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const world = new World();
    
    world.addSystem(createRotationSystem({ world }));
    world.addSystem(createRenderSystem({ canvas, world }));

    world.addEntity('Camera', [
        new PerspectiveCamera({ translation: [0, 0, 5], lookAt: [0, 0, 0], aspect: canvas.width / canvas.height }),
    ]);

    world.addEntity('DemoCube', [
        new Transform(),
        new Rotation([45, 45, 45]),
        new Geometry(cube),
        new Material({ diffuseMap }),
    ]);
    
    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };
    
    window.requestAnimationFrame(tick);
})();
