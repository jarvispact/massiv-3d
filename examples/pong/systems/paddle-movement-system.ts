import { Entity, KeyboardInput, System } from '../../../src';
import { BoundingBox } from '../components/bounding-box';
import { Transform } from '../components/transform';
import { Velocity } from '../components/velocity';
import { world } from '../world';

export const createPaddleMovementSystem = (keyboardInput: KeyboardInput, paddleEntity: Entity): System => {
    const t = paddleEntity.getComponent('Transform') as Transform;
    const v = paddleEntity.getComponent('Velocity') as Velocity;
    const bb = paddleEntity.getComponent('BoundingBox') as BoundingBox;

    return (delta) => {
        const paused = world.state.paused;
        if (!paused && keyboardInput.isKeyDown('ARROW_LEFT')) {
            Transform.translate(t, -v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
            BoundingBox.translate(bb, -v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
        }
        if (!paused && keyboardInput.isKeyDown('ARROW_RIGHT')) {
            Transform.translate(t, v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
            BoundingBox.translate(bb, v.data.velocity[0] * delta, v.data.velocity[1] * delta, v.data.velocity[2] * delta);
        }
    };
};