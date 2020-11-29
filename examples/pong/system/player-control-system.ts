import { BoundingBox, Entity, KeyboardInput, System, Transform, Velocity } from '../../../src';

export const createPlayerControlSystem = (playerEntity: Entity, tableEntity: Entity, keyboardInput: KeyboardInput): System => {
    const playerTransform = playerEntity.getComponentByClass(Transform);
    const playerVelocity = playerEntity.getComponentByClass(Velocity);
    const playerBB = playerEntity.getComponentByClass(BoundingBox).data;
    const tableBB = tableEntity.getComponentByClass(BoundingBox).data;
    const v = playerVelocity.data.translation;

    return (delta) => {
        if (keyboardInput.isKeyDown('ARROW_LEFT') && playerBB.min[0] >= tableBB.min[0]) {
            playerTransform.translate(-v[0] * delta, 0, 0).update();
        }

        if (keyboardInput.isKeyDown('ARROW_RIGHT') && playerBB.max[0] <= tableBB.max[0]) {
            playerTransform.translate(v[0] * delta, 0, 0).update();
        }
    };
};