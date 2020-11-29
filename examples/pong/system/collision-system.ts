import { BoundingBox, Entity, System, Transform, Velocity } from '../../../src';

export const createCollisionSystem = (ballEntity: Entity, tableEntity: Entity): System => {
    const ballTransform = ballEntity.getComponentByClass(Transform);
    const ballVelocity = ballEntity.getComponentByClass(Velocity);
    const ballBoundingBox = ballEntity.getComponentByClass(BoundingBox);
    const tableBoundingBox = tableEntity.getComponentByClass(BoundingBox);

    const bt = ballTransform.data.translation;
    const bbx = ballBoundingBox.data;
    const tbx = tableBoundingBox.data;

    return () => {        
        // ball - right wall
        if (bbx.max[0] >= tbx.max[0]) {
            bt[0] = bt[0] - 0.01;
            ballVelocity.data.translation[0] *= -1;
        }

        // ball - left wall
        if (bbx.min[0] <= tbx.min[0]) {
            bt[0] = bt[0] + 0.01;
            ballVelocity.data.translation[0] *= -1;
        }

        // ball - top wall
        if (bbx.min[2] <= tbx.min[2]) {
            bt[2] = bt[2] + 0.01;
            ballVelocity.data.translation[2] *= -1;
        }

        // TODO REMOVE
        if (bbx.max[2] >= tbx.max[2]) {
            bt[2] = bt[2] - 0.01;
            ballVelocity.data.translation[2] *= -1;
        }
    };
};