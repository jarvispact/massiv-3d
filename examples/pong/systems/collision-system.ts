// import { Entity, System } from '../../../src';
// import { Transform } from '../components/transform';
// import { Velocity } from '../components/velocity';
// import { world, worldActions } from '../world';

// export const createCollisionSystem = (paddleEntity: Entity, ballEntity: Entity, canvas: HTMLCanvasElement): System => {
//     const paddleTransform = paddleEntity.getComponent('Transform') as Transform;
//     const ballTransform = ballEntity.getComponent('Transform') as Transform;
//     const ballVelocity = ballEntity.getComponent('Velocity') as Velocity;

//     const worker = new Worker('../collision-worker.bundle.js');

//     worker.onmessage = (event: WorkerEventMap['message']) => {
//         if (event.data === 'reset') world.dispatch(worldActions.reset());
//     };

//     const aspect = canvas.width / canvas.height;

//     worker.postMessage({
//         type: 'setup',
//         payload: {
//             walls: { left: -aspect * 10, right: aspect * 10, bottom: -10, top: 10 },
//             paddleTransformBuffer: paddleTransform.buffer,
//             ballTransformBuffer: ballTransform.buffer,
//             ballVelocityBuffer: ballVelocity.buffer,
//         },
//     });

//     window.addEventListener('resize', () => {
//         canvas.width = canvas.clientWidth;
//         canvas.height = canvas.clientHeight;

//         const aspect = canvas.width / canvas.height;
//         Transform.setScaling(paddleTransform, 0.4 * aspect, 0.5, 1);

//         worker.postMessage({
//             type: 'setup',
//             payload: {
//                 walls: { left: -aspect * 10, right: aspect * 10, bottom: -10, top: 10 },
//                 paddleTransformBuffer: paddleTransform.buffer,
//                 ballTransformBuffer: ballTransform.buffer,
//                 ballVelocityBuffer: ballVelocity.buffer,
//             },
//         });
//     });

//     return () => worker.postMessage('tick');
// };

import { Entity, System } from '../../../src';
import { BoundingBox } from '../components/bounding-box';
import { Transform } from '../components/transform';
import { Velocity } from '../components/velocity';
import { world, worldActions } from '../world';

const intersecting = (a: BoundingBox, b: BoundingBox) => {
    return (a.data.min[0] <= b.data.max[0] && a.data.max[0] >= b.data.min[0]) &&
           (a.data.min[1] <= b.data.max[1] && a.data.max[1] >= b.data.min[1]) &&
           (a.data.min[2] <= b.data.max[2] && a.data.max[2] >= b.data.min[2]);
};

const blacklist = ['BottomWall', 'TopWall', 'LeftWall', 'RightWall'];

const onIntersection = (a: Entity, b: Entity) => {
    const aTransform = a.getComponent('Transform') as Transform;
    const aVelocity = a.getComponent('Velocity') as Velocity;
    const bBoundingBox = b.getComponent('BoundingBox') as BoundingBox;

    if (a.name === 'Ball' && b.name === 'BottomWall') {
        const newY = bBoundingBox.data.max[1] + (bBoundingBox.data.max[1] - aVelocity.data.velocity[1]);
        console.log(aTransform.data.translation[1], newY);
        Transform.setTranslation(aTransform, aTransform.data.translation[0], newY, aTransform.data.translation[2]);
        aVelocity.data.velocity[1] *= -1;
    }

    if (a.name === 'Ball' && b.name === 'TopWall') {
        const newY = bBoundingBox.data.min[1] - (bBoundingBox.data.min[1] - aVelocity.data.velocity[1]);
        console.log(aTransform.data.translation[1], newY);
        Transform.setTranslation(aTransform, aTransform.data.translation[0], newY, aTransform.data.translation[2]);
        aVelocity.data.velocity[1] *= -1;
    }

    if (a.name === 'Ball' && b.name === 'LeftWall') {
        aVelocity.data.velocity[0] *= -1;
    }

    if (a.name === 'Ball' && b.name === 'RightWall') {
        aVelocity.data.velocity[0] *= -1;
    }
};

export const createCollisionSystem = (): System => {
    return () => {
        const entities = world.queryEntities(['BoundingBox']);
        for (let bb = 0; bb < entities.length; bb++) {
            if (blacklist.includes(entities[bb].name)) continue;
            const boundingBox = entities[bb].getComponent('BoundingBox') as BoundingBox;

            for (let bb2 = 0; bb2 < entities.length; bb2++) {
                if (entities[bb].name === entities[bb2].name) continue;
                const otherBoundingBox = entities[bb2].getComponent('BoundingBox') as BoundingBox;

                if (intersecting(boundingBox, otherBoundingBox)) {
                    console.log('intersection', entities[bb].name, entities[bb2].name);
                    onIntersection(entities[bb], entities[bb2]);
                }
            }
        }
    };
};