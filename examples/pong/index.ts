import { createEntity, KeyboardInput } from '../../src';
import { world } from './world';
import { createTransform } from './components/transform';
import { createVelocity } from './components/velocity';
import { createCollisionSystem } from './systems/collision-system';
import { createPaddleMovementSystem } from './systems/paddle-movement-system';
import { createWebgl2RenderSystem } from './systems/webgl-2-render-system';
import { createBallMovementSystem } from './systems/ball-movement-system';
import { createQuadGeometry } from './components/geometry';
import { OrthographicCamera } from './camera/orthographic-camera';
import { createLevelSystem } from './systems/level-system';

(async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const aspect = canvas.width / canvas.height;

    const keyboardInput = new KeyboardInput(canvas);

    const camera = new OrthographicCamera({ translation: [0, 0, 0], left: -aspect, right: aspect, bottom: -1, top: 1, near: -1, far: 1 });

    const paddle = createEntity('Paddle', [
        createTransform({ translation: [0, -0.95, 0], scaling: [0.4 * aspect, 0.05, 1] }),
        createVelocity(1.5, 0, 0),
        createQuadGeometry(),
    ]);

    const ball = createEntity('Ball', [
        createTransform({ scaling: [0.03, 0.03, 1] }),
        createVelocity(0.5, 1, 0),
        createQuadGeometry(),
    ]);

    world.addEntity(paddle);
    world.addEntity(ball);

    world.addSystem(createWebgl2RenderSystem(canvas, camera));
    world.addSystem(createPaddleMovementSystem(keyboardInput, paddle));
    world.addSystem(createBallMovementSystem(keyboardInput, ball));
    world.addSystem(createCollisionSystem(paddle, ball, canvas));
    world.addSystem(createLevelSystem(ball));

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
