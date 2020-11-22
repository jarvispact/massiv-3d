import { Entity, FileLoader, KeyboardInput, ParsedObjPrimitive, parseObjFile } from '../../src';
import { world } from './world';
import { createTransform, Transform } from './components/transform';
import { createVelocity } from './components/velocity';
import { createCollisionSystem } from './systems/collision-system';
import { createPaddleMovementSystem } from './systems/paddle-movement-system';
import { createWebgl2RenderSystem } from './systems/webgl-2-render-system';
import { createBallMovementSystem } from './systems/ball-movement-system';
import { createGeometry, createQuadGeometry, Geometry } from './components/geometry';
import { OrthographicCamera } from './camera/orthographic-camera';
import { createLevelSystem } from './systems/level-system';
import { vec3 } from 'gl-matrix';
import { createBoundingBox } from './components/bounding-box';

const computeBoundingBox = (geometry: Geometry, transform?: Transform) => {
    const vertices: Array<[number, number, number]> = [];

    for (let p = 0; p < geometry.data.positions.length; p += 3) {
        vertices.push([geometry.data.positions[p], geometry.data.positions[p + 1], geometry.data.positions[p + 2]]);
    }

    const min: [number, number, number] = [0, 0, 0];
    const center: [number, number, number] = [0, 0, 0];
    const max: [number, number, number] = [0, 0, 0];
    
    for (let i = 0; i < geometry.data.indices.length; i++) {
        const idx = geometry.data.indices[i];
        const x = vertices[idx][0];
        const y = vertices[idx][1];
        const z = vertices[idx][2];

        if (x <= min[0]) min[0] = x;
        if (y <= min[1]) min[1] = y;
        if (z <= min[2]) min[2] = z;

        if (x >= max[0]) max[0] = x;
        if (y >= max[1]) max[1] = y;
        if (z >= max[2]) max[2] = z;
    }

    center[0] = (min[0] + max[0]) / 2;
    center[1] = (min[1] + max[1]) / 2;
    center[2] = (min[2] + max[2]) / 2;

    if (transform) {
        vec3.transformMat4(min, min, transform.data.modelMatrix);
        vec3.transformMat4(center, center, transform.data.modelMatrix);
        vec3.transformMat4(max, max, transform.data.modelMatrix);
    }

    return { min, center, max };
};

(async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const aspect = canvas.width / canvas.height;

    const objects = await FileLoader.load('./assets/pong.obj').then(parseObjFile);
    const cube = objects.find(o => o.name === 'Cube') as ParsedObjPrimitive;
    const sphere = objects.find(o => o.name === 'Sphere') as ParsedObjPrimitive;

    // const bottomWallTransform = createTransform({ translation: [0, -9.8, 0], scaling: [28.85, 0.05, 1] });
    const bottomWallTransform = createTransform({ translation: [0, -34.35, 0], scaling: [28.85, 50, 1] });
    const bottomWallGeometry = createQuadGeometry();
    const bottomWallBoundingBox = createBoundingBox(computeBoundingBox(bottomWallGeometry, bottomWallTransform));

    // const topWallTransform = createTransform({ translation: [0, 9.8, 0], scaling: [28.85, 0.05, 1] });
    const topWallTransform = createTransform({ translation: [0, 34.35, 0], scaling: [28.85, 50, 1] });
    const topWallGeometry = createQuadGeometry();
    const topWallBoundingBox = createBoundingBox(computeBoundingBox(topWallGeometry, topWallTransform));

    const leftWallTransform = createTransform({ translation: [-14.4, 0, 0], scaling: [0.05, 19.6, 1] });
    const leftWallGeometry = createQuadGeometry();
    const leftWallBoundingBox = createBoundingBox(computeBoundingBox(leftWallGeometry, leftWallTransform));

    const rightWallTransform = createTransform({ translation: [14.4, 0, 0], scaling: [0.05, 19.6, 1] });
    const rightWallGeometry = createQuadGeometry();
    const rightWallBoundingBox = createBoundingBox(computeBoundingBox(rightWallGeometry, rightWallTransform));

    const paddleTransform = createTransform({ translation: [0, -9, 0], scaling: [1, 0.1, 1] });
    const paddleVelocity = createVelocity(10, 0, 0);
    const paddleGeometry = createGeometry({ positions: cube.positions, indices: cube.indices, normals: cube.normals });
    const paddleBoundingBox = createBoundingBox(computeBoundingBox(paddleGeometry, paddleTransform));

    const ballTransform = createTransform({ scaling: [0.1, 0.1, 1] });
    const ballVelocity = createVelocity(5, 10, 0);
    const ballGeometry = createGeometry({ positions: sphere.positions, indices: sphere.indices, normals: sphere.normals });
    const ballBoundingBox = createBoundingBox(computeBoundingBox(ballGeometry, ballTransform));

    console.log({ paddleTransform, paddleGeometry, paddleBoundingBox });
    console.log({ ballTransform, ballGeometry, ballBoundingBox });
    console.log({ topWallTransform, topWallGeometry, topWallBoundingBox });
    console.log({ bottomWallTransform, bottomWallGeometry, bottomWallBoundingBox });

    const keyboardInput = new KeyboardInput(canvas);

    const camera = new OrthographicCamera({ translation: [0, 0, 0], left: -aspect * 10, right: aspect * 10, bottom: -10, top: 10, near: -10, far: 10 });

    const paddle = new Entity('Paddle', [paddleTransform, paddleVelocity, paddleGeometry, paddleBoundingBox]);
    const ball = new Entity('Ball', [ballTransform, ballVelocity, ballGeometry, ballBoundingBox]);
    const bottomWall = new Entity('BottomWall', [bottomWallTransform, bottomWallGeometry, bottomWallBoundingBox]);
    const topWall = new Entity('TopWall', [topWallTransform, topWallGeometry, topWallBoundingBox]);
    const leftWall = new Entity('LeftWall', [leftWallTransform, leftWallGeometry, leftWallBoundingBox]);
    const rightWall = new Entity('RightWall', [rightWallTransform, rightWallGeometry, rightWallBoundingBox]);
    world.addEntity(paddle);
    world.addEntity(ball);
    world.addEntity(bottomWall);
    world.addEntity(topWall);
    world.addEntity(leftWall);
    world.addEntity(rightWall);

    world.addSystem(createWebgl2RenderSystem(canvas, camera));
    world.addSystem(createPaddleMovementSystem(keyboardInput, paddle));
    world.addSystem(createBallMovementSystem(keyboardInput, ball));
    world.addSystem(createCollisionSystem());
    world.addSystem(createLevelSystem(ball));

    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
})();
