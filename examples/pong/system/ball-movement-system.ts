import { Component, Entity, System, Transform, Velocity } from '../../../src';
import { world } from '../world';

export const createBallMovementSystem = (ballEntity: Entity): System => {
    const ballTransform = ballEntity.getComponentByClass(Transform);
    const ballVelocity = ballEntity.getComponentByClass(Velocity);
    const ballActive = ballEntity.getComponentByType('Active') as Component<'Active', boolean>;
    const v = ballVelocity.data.translation;

    world.subscribe((action, newState) => {
        if (action.type === 'TOGGLE-PAUSE-STATE') {
            ballActive.data = !newState.paused;
        }
    });

    return (delta) => {
        if (!world.state.paused) ballTransform.translate(v[0] * delta, 0, v[2] * delta).update();
    };
};