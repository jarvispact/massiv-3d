import { Entity, KeyboardInput, System } from '../../../src';
import { world, worldActions } from '../world';
import { Transform } from '../components/transform';
import { Velocity } from '../components/velocity';

export const createBallMovementSystem = (keyboardInput: KeyboardInput, ballEntity: Entity): System => {
    const t = ballEntity.getComponentByType('Transform') as Transform;
    const v = ballEntity.getComponentByType('Velocity') as Velocity;

    keyboardInput.onKeyUp((event) => {
        if (event.key === KeyboardInput.KEY.SPACE) world.dispatch(worldActions.togglePauseState());
    });

    return (delta) => {
        if (!world.getState().paused) Transform.translate(t, v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
    };
};