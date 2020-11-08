import { transformFromBuffer, Transform } from '../components/transform';
import { Velocity, velocityFromBuffer } from '../components/velocity';

type Walls = {
    left: number;
    right: number;
    bottom: number;
    top: number;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let walls: Walls = null;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let paddleTransform: Transform = null;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let ballTransform: Transform = null;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let ballVelocity: Velocity = null;

type SetupEvent = {
    type: 'setup';
    payload: {
        walls: Walls;
        paddleTransformBuffer: SharedArrayBuffer;
        ballTransformBuffer: SharedArrayBuffer;
        ballVelocityBuffer: SharedArrayBuffer;
    };
};

const paddleWallOffset = 0.02;
const ballWallOffset = 0.01;

self.addEventListener('message', async (event: WorkerEventMap['message']) => {
    const e = event.data as SetupEvent | 'tick';

    if (typeof e === 'object' && e.type === 'setup') {
        walls = e.payload.walls;
        paddleTransform = transformFromBuffer(e.payload.paddleTransformBuffer);
        ballTransform = transformFromBuffer(e.payload.ballTransformBuffer);
        ballVelocity = velocityFromBuffer(e.payload.ballVelocityBuffer);
    }

    if (e === 'tick') {
        const pt = paddleTransform.data.translation;
        const ps = paddleTransform.data.scaling;
        const bt = ballTransform.data.translation;
        const bs = ballTransform.data.scaling;
        const bv = ballVelocity.data.velocity;
        
        const halfPaddleWidth = ps[0] / 2;
        const halfPaddleHeight = ps[1] / 2;
        const halfBallWidth = bs[0] / 2;

        // PADDLE LEFT COLLISION CHECK
        if (pt[0] - halfPaddleWidth <= walls.left + paddleWallOffset) {
            pt[0] = walls.left + halfPaddleWidth + paddleWallOffset;
        }

        // PADDLE RIGHT COLLISION CHECK
        if (pt[0] + halfPaddleWidth >= walls.right - paddleWallOffset) {
            pt[0] = walls.right - halfPaddleWidth - paddleWallOffset;
        }

        // BALL LEFT COLLISION CHECK
        if (bt[0] - halfBallWidth <= walls.left + ballWallOffset) {
            bt[0] = walls.left + halfBallWidth + ballWallOffset;
            bv[0] *= -1;
        }

        // BALL RIGHT COLLISION CHECK
        if (bt[0] + halfBallWidth >= walls.right - ballWallOffset) {
            bt[0] = walls.right - halfBallWidth - ballWallOffset;
            bv[0] *= -1;
        }

        // BALL BOTTOM COLLISION CHECK
        if (bt[1] - halfBallWidth <= walls.bottom + ballWallOffset) {
            bt[1] = walls.bottom + halfBallWidth + ballWallOffset;
            Transform.setTranslation(ballTransform, 0, 0, 0);
            bv[0] = (Math.round(Math.random()) * 2 - 1) / 2;
            bv[1] = 1;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            self.postMessage('reset');
        }

        // BALL TOP COLLISION CHECK
        if (bt[1] + halfBallWidth >= walls.top - ballWallOffset) {
            bt[1] = walls.top - halfBallWidth - ballWallOffset;
            bv[1] *= -1;
        }

        // PADDLE - BALL COLLISION CHECK
        const ballPaddleYCollision = bt[1] - halfBallWidth <= pt[1] + halfPaddleHeight;
        const ballPaddleMiddleCollision = bt[0] >= pt[0] - halfPaddleWidth / 2 && bt[0] <= pt[0] + halfPaddleWidth / 2;
        const ballPaddleLeftCollision = bt[0] >= pt[0] - halfPaddleWidth && bt[0] <= pt[0] - halfPaddleWidth / 2;
        const ballPaddleRightCollision = bt[0] >= pt[0] + halfPaddleWidth / 2 && bt[0] <= pt[0] + halfPaddleWidth;

        if (ballPaddleYCollision && ballPaddleLeftCollision) {
            bt[1] = pt[1] + halfPaddleHeight;
            bv[1] *= -1;
            bv[0] -= 0.2;
        }

        if (ballPaddleYCollision && ballPaddleMiddleCollision) {
            bt[1] = pt[1] + halfPaddleHeight;
            bv[1] *= -1;
        }

        if (ballPaddleYCollision && ballPaddleRightCollision) {
            bt[1] = pt[1] + halfPaddleHeight;
            bv[1] *= -1;
            bv[0] += 0.2;
        }
    }
});