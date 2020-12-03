import { BoundingBox, Component, Entity, FileLoader, Geometry, ParsedObjPrimitive, parseObjFile, Transform, Velocity } from '../../src';
import { world } from './world';
import { PerspectiveCamera } from './camera/perspective-camera';
import { createWebgl2RenderSystem } from './system/webgl-2-render-system';
import { vec3 } from 'gl-matrix';
import { createLevelSystem } from './system/level-system';
import { createCollisionSystem } from './system/collision-system';
import { createMovementSystem } from './system/movement-system';
import { createInputSystem } from './system/input-system';

const createColorComponent = (r: number, g: number, b: number): Component<'Color', vec3> => ({ type: 'Color', data: vec3.fromValues(r, g, b) });
const createActiveComponent = (initialActive: boolean): Component<'Active', boolean> => ({ type: 'Active', data: initialActive });

const randomNegative = (val: number) => Math.round(Math.random()) === 0 ? -val : val;

(async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const info = document.getElementById('info') as HTMLDivElement;
    world.subscribe((action, newState) => {
        if (action.type === 'RESET' || action.type === 'TOGGLE-PAUSE-STATE' && newState.paused) {
            info.style.display = 'block';
        } else if (action.type === 'TOGGLE-PAUSE-STATE' && !newState.paused) {
            info.style.display = 'none';
        }
    });

    const camera = new PerspectiveCamera({ translation: [0, 3, 10], fov: 45, aspect: canvas.width / canvas.height, near: 0.01, far: 1000 });

    const objects = await FileLoader.load('./assets/pong.obj').then(parseObjFile);
    const ball = objects.find(o => o.name === 'Ball_Sphere') as ParsedObjPrimitive;
    const table = objects.find(o => o.name === 'Table_Cube') as ParsedObjPrimitive;
    const player = objects.find(o => o.name === 'Player_Cube.001') as ParsedObjPrimitive;

    const ballTransform = new Transform();
    const ballGeometry = new Geometry(ball);
    const ballVelocity = new Velocity({ translation: [randomNegative(1.5), 0, -5] });
    const ballBoundingBox = BoundingBox.fromGeometry(ballGeometry, ballTransform);
    const ballEntity = new Entity('Ball', [ballTransform, ballGeometry, ballVelocity, ballBoundingBox, createColorComponent(1, 0, 0), createActiveComponent(false)]);

    const playerTransform = new Transform();
    const playerGeometry = new Geometry(player);
    const playerVelocity = new Velocity({ translation: [0, 0, 0] });
    const playerBoundingBox = BoundingBox.fromGeometry(playerGeometry, playerTransform);
    const playerEntity = new Entity('Player', [playerTransform, playerGeometry, playerVelocity, playerBoundingBox, createColorComponent(0, 1, 0), createActiveComponent(true)]);

    const tableTransform = new Transform();
    const tableGeometry = new Geometry(table);
    const tableBoundingBox = BoundingBox.fromGeometry(tableGeometry, tableTransform);    
    const tableEntity = new Entity('Table', [tableTransform, tableGeometry, tableBoundingBox, createColorComponent(0.6, 0.6, 0.6), createActiveComponent(false)]);

    world.addSystem(createInputSystem(canvas, playerEntity, ballEntity));
    world.addSystem(createMovementSystem());
    world.addSystem(createLevelSystem(ballEntity));
    world.addSystem(createCollisionSystem(ballEntity, playerEntity, tableEntity));
    world.addSystem(createWebgl2RenderSystem(canvas, camera));

    world.addEntity(ballEntity);
    world.addEntity(playerEntity);
    world.addEntity(tableEntity);

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
