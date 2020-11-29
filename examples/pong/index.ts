import { BoundingBox, Component, Entity, FileLoader, Geometry, KeyboardInput, ParsedObjPrimitive, parseObjFile, Transform, Velocity } from '../../src';
import { world, worldActions } from './world';
import { PerspectiveCamera } from './camera/perspective-camera';
import { createWebgl2RenderSystem } from './system/webgl-2-render-system';
import { vec3 } from 'gl-matrix';
import { createPlayerControlSystem } from './system/player-control-system';
import { createBallMovementSystem } from './system/ball-movement-system';
import { createLevelSystem } from './system/level-system';
import { createCollisionSystem } from './system/collision-system';
import { createUpdateBoundingBoxSystem } from './system/update-bounding-box-system';

const createColorComponent = (r: number, g: number, b: number): Component<'Color', vec3> => ({ type: 'Color', data: vec3.fromValues(r, g, b) });
const createActiveComponent = (initialActive: boolean): Component<'Active', boolean> => ({ type: 'Active', data: initialActive });

const randomNegative = (val: number) => Math.round(Math.random()) === 0 ? -val : val;

(async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const camera = new PerspectiveCamera({ translation: [0, 3, 10], fov: 45, aspect: canvas.width / canvas.height, near: 0.01, far: 1000 });
    const keyboardInput = new KeyboardInput(canvas);

    keyboardInput.onKeyUp((event) => {
        if (event.key === KeyboardInput.KEY.SPACE) world.dispatch(worldActions.togglePauseState());
    });

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
    const playerVelocity = new Velocity({ translation: [5, 0, 0] });
    const playerBoundingBox = BoundingBox.fromGeometry(playerGeometry, playerTransform);
    const playerEntity = new Entity('Player', [playerTransform, playerGeometry, playerVelocity, playerBoundingBox, createColorComponent(0, 1, 0), createActiveComponent(true)]);

    const tableTransform = new Transform();
    const tableGeometry = new Geometry(table);
    const tableBoundingBox = BoundingBox.fromGeometry(tableGeometry, tableTransform);    
    const tableEntity = new Entity('Table', [tableTransform, tableGeometry, tableBoundingBox, createColorComponent(0.6, 0.6, 0.6), createActiveComponent(false)]);

    world.addSystem(createWebgl2RenderSystem(canvas, camera));
    world.addSystem(createPlayerControlSystem(playerEntity, tableEntity, keyboardInput));
    world.addSystem(createBallMovementSystem(ballEntity));
    world.addSystem(createUpdateBoundingBoxSystem());
    world.addSystem(createLevelSystem(ballEntity));
    world.addSystem(createCollisionSystem(ballEntity, tableEntity));

    world.addEntity(ballEntity);
    world.addEntity(playerEntity);
    world.addEntity(tableEntity);

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
