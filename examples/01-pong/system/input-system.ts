import { Entity, KeyboardInput, System } from '../../../src';
import { Velocity } from '../velocity';
import { world, worldActions } from '../world';

export const createInputSystem = (canvas: HTMLCanvasElement, playerEntity: Entity): System => {
    const keyboardInput = new KeyboardInput(canvas);
    const playerVelocity = playerEntity.getComponentByClass(Velocity);

    keyboardInput.onKeyUp((event) => {
        if (event.key === KeyboardInput.KEY.SPACE) world.dispatch(worldActions.togglePauseState());
    });

    return () => {
        const leftDown = keyboardInput.isKeyDown('ARROW_LEFT');
        const rightDown = keyboardInput.isKeyDown('ARROW_RIGHT');
        
        if (leftDown && rightDown) {
            playerVelocity.data.translation[0] = 0;
        } else if (leftDown) {
            playerVelocity.data.translation[0] = -5;
        } else if (rightDown) {
            playerVelocity.data.translation[0] = 5;
        } else {
            playerVelocity.data.translation[0] = 0;
        }
    };
};