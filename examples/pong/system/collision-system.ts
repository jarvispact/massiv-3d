import { BoundingBox, Entity, System, Transform, Velocity } from '../../../src';

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

    return () => {        
        // ball - right wall
        if (bbx.max[0] >= tbx.max[0]) {
            const halfBallWidthX = Math.abs(bbx.max[0] - bbx.min[0]) / 2;
            ballTransform.setTranslationX(tbx.max[0] - halfBallWidthX - 0.01).update();
            ballVelocity.data.translation[0] *= -1;
        }

        // ball - left wall
        if (bbx.min[0] <= tbx.min[0]) {
            const halfBallWidthX = Math.abs(bbx.max[0] - bbx.min[0]) / 2;
            ballTransform.setTranslationX(tbx.min[0] + halfBallWidthX + 0.01).update();
            ballVelocity.data.translation[0] *= -1;
        }

        // ball - top wall
        if (bbx.min[2] <= tbx.min[2]) {
            const halfBallWidthZ = Math.abs(bbx.max[2] - bbx.min[2]) / 2;
            ballTransform.setTranslationZ(tbx.min[2] + halfBallWidthZ + 0.01).update();
            ballVelocity.data.translation[2] *= -1;
        }

        // TODO REMOVE
        // ball - bottom wall
        if (bbx.max[2] >= tbx.max[2]) {
            const halfBallWidthZ = Math.abs(bbx.max[2] - bbx.min[2]) / 2;
            ballTransform.setTranslationZ(tbx.max[2] - halfBallWidthZ - 0.01).update();
            ballVelocity.data.translation[2] *= -1;
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