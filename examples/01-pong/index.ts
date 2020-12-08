import { BoundingBox, Entity, FileLoader, Geometry, getWebgl2Context, ParsedObjPrimitive, parseObjFile, Transform, UBO } from '../../src';
import { world } from './world';
import { PerspectiveCamera } from './camera/perspective-camera';
import { createWebgl2RenderSystem } from './system/webgl-2-render-system';
import { createLevelSystem } from './system/level-system';
import { createCollisionSystem } from './system/collision-system';
import { createMovementSystem } from './system/movement-system';
import { createInputSystem } from './system/input-system';
import { getCameraUBOConfig, createColorComponent, randomNegative, createAnimationComponent, createAudioComponent } from './misc';
// import { createRenderBoundingBoxSystem } from './system/render-bounding-box-system';
import { createAnimationSystem } from './system/animation-system';
import { Velocity } from './velocity';

(async () => {
    const objects = await FileLoader.load('./assets/pong.obj').then(parseObjFile);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = getWebgl2Context(canvas);

    const info = document.getElementById('info') as HTMLDivElement;
    world.subscribe((action, newState) => {
        if (action.type === 'RESET' || (action.type === 'TOGGLE-PAUSE-STATE' && newState.paused)) {
            info.style.display = 'block';
        } else if (action.type === 'TOGGLE-PAUSE-STATE' && !newState.paused) {
            info.style.display = 'none';
        }
    });

    const camera = new PerspectiveCamera({ translation: [0, 3, 10], fov: 45, aspect: canvas.width / canvas.height, near: 0.01, far: 1000 });
    const ubo = new UBO(gl, 'CameraUniforms', 0, getCameraUBOConfig(camera));

    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        camera.setAspect(canvas.width / canvas.height);
        ubo.setView('CameraUniforms.projectionMatrix', camera.projectionMatrix).update();
    });

    const ballTransform = new Transform();
    const ballGeometry = new Geometry(objects.find(o => o.name === 'Ball_Sphere') as ParsedObjPrimitive);
    const ballVelocity = new Velocity({ translation: [randomNegative(1.5), 0, -5] });
    const ballBoundingBox = BoundingBox.fromGeometry(ballGeometry, ballTransform);
    const audioComponent = createAudioComponent({ collision: './assets/pong.wav', gameover: './assets/game-over.wav' });
    const ballEntity = new Entity('Ball', [ballTransform, ballGeometry, ballVelocity, ballBoundingBox, createColorComponent(1, 0, 0), audioComponent]);

    const playerTransform = new Transform();
    const playerGeometry = new Geometry(objects.find(o => o.name === 'Player_Cube.001') as ParsedObjPrimitive);
    const playerVelocity = new Velocity({ translation: [0, 0, 0] });
    const playerBoundingBox = BoundingBox.fromGeometry(playerGeometry, playerTransform);

    const playerBounceBackAnimation = createAnimationComponent({
        easingFunction: (x: number) => x < 0.5 ? 1 - Math.pow(1 - x, 3) : 1 - Math.pow(x, 3),
    });

    const playerEntity = new Entity('Player', [playerTransform, playerGeometry, playerVelocity, playerBoundingBox, createColorComponent(0, 1, 0), playerBounceBackAnimation]);

    const tableTransform = new Transform();
    const tableGeometry = new Geometry(objects.find(o => o.name === 'Table_Cube') as ParsedObjPrimitive);
    const tableBoundingBox = BoundingBox.fromGeometry(tableGeometry, tableTransform);
    const tableEntity = new Entity('Table', [tableTransform, tableGeometry, tableBoundingBox, createColorComponent(0.6, 0.6, 0.6)]);

    world.addSystem(createInputSystem(canvas, playerEntity));
    world.addSystem(createMovementSystem());
    world.addSystem(createLevelSystem(ballEntity));
    world.addSystem(createAnimationSystem());
    world.addSystem(createCollisionSystem(ballEntity, playerEntity, tableEntity));
    world.addSystem(createWebgl2RenderSystem(gl, ubo));
    // world.addSystem(createRenderBoundingBoxSystem(gl, ubo));

    world.addEntity(ballEntity);
    world.addEntity(playerEntity);
    world.addEntity(tableEntity);

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
