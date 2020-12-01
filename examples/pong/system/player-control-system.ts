import { Entity, KeyboardInput, System, Transform, Velocity } from '../../../src';

export const createPlayerControlSystem = (playerEntity: Entity, tableEntity: Entity, keyboardInput: KeyboardInput): System => {
    const playerTransform = playerEntity.getComponentByClass(Transform);
    const playerVelocity = playerEntity.getComponentByClass(Velocity);
    const v = playerVelocity.data.translation;

    return (delta) => {
        if (keyboardInput.isKeyDown('ARROW_LEFT')) {
            playerTransform.translate(-v[0] * delta, 0, 0).update();
        }

        if (keyboardInput.isKeyDown('ARROW_RIGHT')) {
            playerTransform.translate(v[0] * delta, 0, 0).update();
        }
    };
};