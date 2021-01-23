import { vec3 } from 'gl-matrix';
import { ImageLoader, World } from '../../src';
import { Geometry } from './components/geometry';
import { Material } from './components/material';
import { PerspectiveCamera } from './components/perspective-camera';
import { Rotation } from './components/rotation';
import { Transform } from './components/transform';
import { createRenderSystem } from './systems/render-system';
import { createRotationSystem } from './systems/rotation-system';

(async () => {
    const diffuseMap = await ImageLoader.load('./assets/brick-diffuse-map.jpg');

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const world = new World();
    
    world.addSystem(createRotationSystem({ world }));
    world.addSystem(createRenderSystem({ canvas, world }));

    world.addEntity('Camera', [
        new PerspectiveCamera({ translation: [0, 0, 4], lookAt: [0, 0, 0], aspect: canvas.width / canvas.height }),
    ]);

    const data: Array<{translation: vec3, degrees: number}> = [
        { translation: [-1, 1, 0], degrees: 45 },
        { translation: [1, 1, 0], degrees: 90 },
        { translation: [-1, -1, 0], degrees: 135 },
        { translation: [1, -1, 0], degrees: 180 },
    ];

    data.forEach(({ translation, degrees }, idx) => {
        world.addEntity(`DemoPlane-${idx}`, [
            new Transform({ translation }),
            new Rotation({ degrees }),
            new Geometry({
                positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
                indices: [0, 1, 2, 0, 2, 3],
                uvs: [0, 0, 1, 0, 1, 1, 0, 1],
            }),
            new Material({ diffuseMap }),
        ]);
    });
    
    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };
    
    window.requestAnimationFrame(tick);
})();
