import { vec3 } from 'gl-matrix';
import { PerspectiveCamera, RawGeometry, System, Transform, UnlitMaterial, UpdateCameraSystem, UpdateTransformSystem, WebGL2RenderSystem, World } from '../../src';
import { Renderable } from '../../src/components/renderable';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const world = new World();

const cameraEntity = world.registerEntity([
    new PerspectiveCamera({ translation: [0, 15, 25], aspect: canvas.width / canvas.height })
]);

const size = 7;
const translations = [] as vec3[];
for (let x = -size; x < size; x++) {
    for (let y = -size; y < size; y++) {
        for (let z = -size; z < size; z++) {
            translations.push([x, y, z]);
        }
    }
}

const rand = (): number => Math.random();

translations.forEach(translation => {
    world.registerEntity([
        new Transform({ translation }),
        new Renderable({
            material: new UnlitMaterial({ color: [rand(), rand(), rand()] }),
            geometry: new RawGeometry({
                positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
                indices: [0, 1, 2, 0, 2, 3],
            }),
        }),
    ]);
});

// world.registerEntity([
//     new Transform(),
//     new Renderable({
//         material: new UnlitMaterial({ color: [rand(), rand(), rand()] }),
//         geometry: new RawGeometry({
//             positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
//             indices: [0, 1, 2, 0, 2, 3],
//         }),
//     }),
// ]);

class RotationSystem extends System {
    update(delta: number): void {
        const transforms = this.world.getComponentsByType(Transform);
        for (let i = 0; i < transforms.length; i++) {
            const t = transforms[i];
            t.rotate(0, 15 * delta, 0);
        }
    }
}

world.registerSystem(new RotationSystem());
world.registerSystem(new UpdateCameraSystem());
world.registerSystem(new UpdateTransformSystem());
world.registerRenderSystem(new WebGL2RenderSystem(canvas, cameraEntity));

let counter = 0;
let measurements = [] as number[];

let oneSecond = Date.now() + 1000;

const tick = (now: number): void => {
    const before = Date.now();
    world.update(now);
    world.render(now);
    window.requestAnimationFrame(tick);
    const after = Date.now();
    measurements.push(after - before);
    counter++;
    if (Date.now() > oneSecond) {
        const avg = measurements.reduce((accum, val) => accum + val, 0) / counter;
        console.log(`avg tick time: ${avg} ms`);
        measurements = [];
        counter = 0;
        oneSecond = Date.now() + 1000;
    }
};

window.requestAnimationFrame(tick);