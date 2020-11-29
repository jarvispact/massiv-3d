import { Entity, System, Velocity } from '../../../src';
import { world, worldActions } from '../world';

export const createLevelSystem = (ballEntity: Entity): System => {
    const v = ballEntity.getComponentByClass(Velocity);

    const levelDisplay = document.getElementById('level') as HTMLHeadingElement;
    levelDisplay.textContent = `Level: ${world.state.level}`;

    let currentLevelStartTime = Date.now();
    let savedPauseOffset = 0;
    const levelTime = 1000 * 5;

    world.subscribe((action, newState) => {
        if (action.type === 'TOGGLE-PAUSE-STATE') {
            if (newState.paused) {
                savedPauseOffset = Date.now() - currentLevelStartTime;
            } else {
                currentLevelStartTime = Date.now() - savedPauseOffset;
            }
        }

        if (action.type === 'RESET') {
            levelDisplay.textContent = `Level: ${newState.level}`;
        }
    });

    return () => {
        if (!world.state.paused && Date.now() >= currentLevelStartTime + levelTime) {
            world.dispatch(worldActions.levelUp());
            savedPauseOffset = 0;
            currentLevelStartTime = Date.now();
            levelDisplay.textContent = `Level: ${world.state.level}`;

            if (v.data.translation[0] < 0) {
                v.data.translation[0] += v.data.translation[0] / 5;
            } else {
                v.data.translation[0] += v.data.translation[0] / 5;
            }

            if (v.data.translation[2] < 0) {
                v.data.translation[2] += v.data.translation[2] / 5;
            } else {
                v.data.translation[2] += v.data.translation[2] / 5;
            }
        }
    };
};