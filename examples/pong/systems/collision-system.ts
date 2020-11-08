import { Entity, System } from '../../../src';
import { Transform } from '../components/transform';
import { Velocity } from '../components/velocity';
import { world, worldActions } from '../world';

export const createCollisionSystem = (paddleEntity: Entity, ballEntity: Entity, canvas: HTMLCanvasElement): System => {
    const paddleTransform = paddleEntity.getComponent('Transform') as Transform;
    const ballTransform = ballEntity.getComponent('Transform') as Transform;
    const ballVelocity = ballEntity.getComponent('Velocity') as Velocity;

    const worker = new Worker('../collision-worker.bundle.js');

    worker.onmessage = (event: WorkerEventMap['message']) => {
        if (event.data === 'reset') world.dispatch(worldActions.reset());
    };

    const aspect = canvas.width / canvas.height;

    worker.postMessage({
        type: 'setup',
        payload: {
            walls: { left: -aspect, right: aspect, bottom: -1, top: 1 },
            paddleTransformBuffer: paddleTransform.buffer,
            ballTransformBuffer: ballTransform.buffer,
            ballVelocityBuffer: ballVelocity.buffer,
        },
    });

    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const aspect = canvas.width / canvas.height;
        Transform.setScaling(paddleTransform, 0.4 * aspect, 0.05, 1);

        worker.postMessage({
            type: 'setup',
            payload: {
                walls: { left: -aspect, right: aspect, bottom: -1, top: 1 },
                paddleTransformBuffer: paddleTransform.buffer,
                ballTransformBuffer: ballTransform.buffer,
                ballVelocityBuffer: ballVelocity.buffer,
            },
        });
    });

    return () => worker.postMessage('tick');
};