import { Entity, KeyboardInput, System } from '../../../src';
import { world, worldActions } from '../world';
import { Transform } from '../components/transform';
import { Velocity } from '../components/velocity';
import { BoundingBox } from '../components/bounding-box';

export const createBallMovementSystem = (keyboardInput: KeyboardInput, ballEntity: Entity): System => {
    const t = ballEntity.getComponent('Transform') as Transform;
    const v = ballEntity.getComponent('Velocity') as Velocity;
    const bb = ballEntity.getComponent('BoundingBox') as BoundingBox;

    keyboardInput.onKeyUp((event) => {
        if (event.key === KeyboardInput.KEY.SPACE) world.dispatch(worldActions.togglePauseState());
    });

    return (delta) => {
        if (!world.state.paused) {
            Transform.translate(t, v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
            BoundingBox.translate(bb, v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
        }
    };
};