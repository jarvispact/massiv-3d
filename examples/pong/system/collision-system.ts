import { BoundingBox, Entity, System, Transform, Velocity } from '../../../src';
import { randomNegative } from '../misc';
import { world, worldActions } from '../world';

export const createCollisionSystem = (ballEntity: Entity, playerEntity: Entity, tableEntity: Entity): System => {
    const ballTransform = ballEntity.getComponentByClass(Transform);
    const ballVelocity = ballEntity.getComponentByClass(Velocity);
    const ballBoundingBox = ballEntity.getComponentByClass(BoundingBox);

    const playerTransform = playerEntity.getComponentByClass(Transform);
    const playerBoundingBox = playerEntity.getComponentByClass(BoundingBox);

    const tableBoundingBox = tableEntity.getComponentByClass(BoundingBox);

    const bbx = ballBoundingBox.data;
    const pbx = playerBoundingBox.data;
    const tbx = tableBoundingBox.data;

    world.subscribe((action) => {
        if (action.type === 'RESET') {
            ballTransform.setTranslation(0, 0, 0).update();
            playerTransform.setTranslation(0, 0, 0).update();
            ballVelocity.setTranslation(randomNegative(1.5), 0, -5);
        }
    });

    return () => {
        const halfBallWidthX = Math.abs(bbx.max[0] - bbx.min[0]) / 2;
        const halfBallWidthZ = Math.abs(bbx.max[2] - bbx.min[2]) / 2;

        // ball - right wall
        if (bbx.max[0] >= tbx.max[0]) {
            ballTransform.setTranslationX(tbx.max[0] - halfBallWidthX - 0.01).update();
            ballVelocity.data.translation[0] *= -1;
        }

        // ball - left wall
        if (bbx.min[0] <= tbx.min[0]) {
            ballTransform.setTranslationX(tbx.min[0] + halfBallWidthX + 0.01).update();
            ballVelocity.data.translation[0] *= -1;
        }

        // ball - top wall
        if (bbx.min[2] <= tbx.min[2]) {
            ballTransform.setTranslationZ(tbx.min[2] + halfBallWidthZ + 0.01).update();
            ballVelocity.data.translation[2] *= -1;
        }

        // ball - bottom wall (reset)
        if (bbx.max[2] >= tbx.max[2]) {
            world.dispatch(worldActions.reset());
        }

        // ball - player
        if (bbx.max[2] >= pbx.min[2] && bbx.center[0] >= pbx.min[0] && bbx.center[0] <= pbx.max[0]) {
            const playerWidthX = Math.abs(pbx.max[0] - pbx.min[0]);
            ballTransform.setTranslationZ(pbx.min[2] - halfBallWidthZ - 0.01).update();
            ballVelocity.data.translation[2] *= -1;

            if (bbx.center[0] >= pbx.center[0] + playerWidthX / 3.3) {
                if (ballVelocity.data.translation[0] >= 0) {
                    ballVelocity.data.translation[0] += 2;
                } else {
                    ballVelocity.data.translation[0] += 1;
                }
            } else if (bbx.center[0] <= pbx.center[0] - playerWidthX / 3.3) {
                if (ballVelocity.data.translation[0] >= 0) {
                    ballVelocity.data.translation[0] -= 1;
                } else {
                    ballVelocity.data.translation[0] -= 2;
                }
            }
        }

        // player - right wall
        if (pbx.max[0] >= tbx.max[0]) {
            const halfPlayerWidthX = Math.abs(pbx.max[0] - pbx.min[0]) / 2;
            playerTransform.setTranslationX(tbx.max[0] - halfPlayerWidthX - 0.01).update();
        }

        // player - left wall
        if (pbx.min[0] <= tbx.min[0]) {
            const halfPlayerWidthX = Math.abs(pbx.max[0] - pbx.min[0]) / 2;
            playerTransform.setTranslationX(tbx.min[0] + halfPlayerWidthX + 0.01).update();
        }
    };
};