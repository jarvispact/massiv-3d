import { Entity, KeyboardInput, System } from '../../../src';
import { Transform } from '../components/transform';
import { Velocity } from '../components/velocity';
import { world } from '../world';

export const createPaddleMovementSystem = (keyboardInput: KeyboardInput, paddleEntity: Entity): System => {
    const t = paddleEntity.getComponentByType('Transform') as Transform;
    const v = paddleEntity.getComponentByType('Velocity') as Velocity;

    return (delta) => {
        const paused = world.getState().paused;
        if (!paused && keyboardInput.isKeyDown('ARROW_LEFT')) Transform.translate(t, -v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
        if (!paused && keyboardInput.isKeyDown('ARROW_RIGHT')) Transform.translate(t, v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
    };
};