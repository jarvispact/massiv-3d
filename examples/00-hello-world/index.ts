import { vec3 } from 'gl-matrix';
import { PerspectiveCamera, Renderable, RawGeometry, System, Transform, UnlitMaterial, UpdateCameraSystem, UpdateTransformSystem, WebGL2RenderSystem, World, ResizeCanvasEvent, PhongMaterial, DirectionalLight, KeyboardInput, Entity } from '../../src';

const positions = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
];

const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
];

const normals = [
    // Front
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,

    // Back
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,

    // Top
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,

    // Bottom
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,

    // Right
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
];

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const world = new World();
const keyboardInput = new KeyboardInput(canvas);

const cameraEntity = world.registerEntity([
    new PerspectiveCamera({ translation: [0, 10, 25], aspect: canvas.width / canvas.height })
]);

// world.registerEntity([
//     new DirectionalLight({ direction: [0, 3, 3] }),
// ]);

// world.registerEntity([
//     new DirectionalLight({ direction: [-5, 5, 5] }),
// ]);

// const size = 7;
// const translations = [] as vec3[];
// for (let x = -size; x < size; x++) {
//     for (let y = -size; y < size; y++) {
//         for (let z = -size; z < size; z++) {
//             translations.push([x, y, z]);
//         }
//     }
// }

// const rand = (): number => Math.random();

// translations.forEach(translation => {
//     world.registerEntity([
//         new Transform({ translation }),
//         new Renderable({
//             material: new UnlitMaterial({ color: [rand(), rand(), rand()] }),
//             geometry: new RawGeometry({
//                 positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
//                 indices: [0, 1, 2, 0, 2, 3],
//             }),
//         }),
//     ]);
// });

// world.registerEntity([
//     new Transform(),
//     new Renderable({
//         // material: new UnlitMaterial({ color: [rand(), rand(), rand()] }),
//         material: new PhongMaterial({ diffuseColor: [1, 0, 0], specularShininess: 256 }),
//         geometry: new RawGeometry({
//             positions,
//             normals,
//             indices,
//         }),
//         // geometry: new RawGeometry({
//         //     positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
//         //     normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
//         //     indices: [0, 1, 2, 0, 2, 3],
//         // }),
//         // geometry: new RawGeometry({
//         //     positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
//         // }),
//     }),
// ]);

class RotationSystem extends System {
    update(delta: number): void {
        const transforms = this.world.getComponentsByType(Transform);
        for (let i = 0; i < transforms.length; i++) {
            const t = transforms[i];
            t.rotate(15 * delta, 0, 0);
        }
    }
}

const rand = (): number => Math.random() * 20 - 10;

let entities: Entity[] = [];
let light1: Entity | null, light2: Entity | null;

class DynamicSystem extends System {
    update(): void {
        if (keyboardInput.isKeyDown('ArrowUp')) {
            entities.push(world.registerEntity([
                new Transform({ translation: [rand(), rand(), rand()] }),
                new Renderable({
                    material: new PhongMaterial({ diffuseColor: [1, 0, 0], specularShininess: 256 }),
                    geometry: new RawGeometry({
                        positions,
                        normals,
                        indices,
                    }),
                }),
            ]));
        }
        if (keyboardInput.isKeyDown('ArrowDown')) {
            const entity = entities[0];
            if (entity) {
                entities = entities.filter(e => e !== entity);
                world.removeEntity(entity);
            }
        }
        if (keyboardInput.keyPressed('1')) {
            if (!light1) {
                light1 = world.registerEntity([
                    new DirectionalLight({ direction: [-3, 3, 0] }),
                ]);
            }
        }
        if (keyboardInput.keyPressed('2')) {
            if (!light2) {
                light2 = world.registerEntity([
                    new DirectionalLight({ direction: [3, 3, 0] }),
                ]);
            }
        }
        if (keyboardInput.keyPressed('3')) {
            if (light1) {
                world.removeEntity(light1);
                light1 = null;
            }
        }
        if (keyboardInput.keyPressed('4')) {
            if (light2) {
                world.removeEntity(light2);
                light2 = null;
            }
        }
    }
}

// world.registerSystem(new RotationSystem());
world.registerSystem(new DynamicSystem());
world.registerSystem(new UpdateCameraSystem());
world.registerSystem(new UpdateTransformSystem());

world.registerRenderSystem(new WebGL2RenderSystem(canvas, cameraEntity));

// let counter = 0;
// let measurements = [] as number[];

// let oneSecond = Date.now() + 1000;

// const tick = (now: number): void => {
//     const before = Date.now();
//     world.update(now);
//     world.render(now);
//     window.requestAnimationFrame(tick);
//     const after = Date.now();
//     measurements.push(after - before);
//     counter++;
//     if (Date.now() > oneSecond) {
//         const avg = measurements.reduce((accum, val) => accum + val, 0) / counter;
//         console.log(`avg tick time: ${avg} ms`);
//         measurements = [];
//         counter = 0;
//         oneSecond = Date.now() + 1000;
//     }
// };

const tick = (now: number): void => {
    world.update(now);
    world.render(now);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);

window.addEventListener('resize', () => {
    world.publish(new ResizeCanvasEvent({ width: canvas.clientWidth, height: canvas.clientHeight }));
});