import { KeyboardInput, System, World } from '../../src';
import { easeInOutQuint, easeOutBounce, easeOutElastic } from './easings';
import { Transform } from './transform';
import { createTween } from './tween';

export const createAnimationSystem = (keyboardInput: KeyboardInput, world: World): System => {
    const tween1 = createTween(easeOutElastic);
    const tween2 = createTween(easeOutBounce);
    const tween3 = createTween(easeInOutQuint);
    let tween = tween1;

    keyboardInput.onKeyUp(event => {
        if (event.key === KeyboardInput.KEY.NUM_1) {
            tween = tween1;
            tween.start();
        }
        if (event.key === KeyboardInput.KEY.NUM_2) {
            tween = tween2;
            tween.start();
        }
        if (event.key === KeyboardInput.KEY.NUM_3) {
            tween = tween3;
            tween.start();
        }
    });

    return (delta) => {
        const entities = world.queryEntities(['Transform']);

        for (let e = 0; e < entities.length; e++) {
            const entity = entities[e];
            if (tween.isRunning()) entity.getComponent(Transform).rotate(0, tween.getValue() * 360, 0);
        }

        tween.update(0.5 * delta);
    };
}