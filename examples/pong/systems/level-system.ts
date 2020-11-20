import { Entity, System } from '../../../src';
import { Velocity } from '../components/velocity';
import { world, worldActions } from '../world';

export const createLevelSystem = (ballEntity: Entity): System => {
    const v = ballEntity.getComponent('Velocity') as Velocity;

    const levelDisplay = document.getElementById('level') as HTMLHeadingElement;
    levelDisplay.textContent = `Level: ${world.state.level}`;

    let currentLevelStartTime = Date.now();
    let savedPauseOffset = 0;
    const levelTime = 1000 * 5;
    const speedIncreasePerLevel = 1;

    world.subscribe((action, newState) => {
        if (action.type === 'TOGGLE-PAUSE-STATE' && newState.paused) {
            savedPauseOffset = Date.now() - currentLevelStartTime;
        }
        if (action.type === 'TOGGLE-PAUSE-STATE' && !newState.paused) {
            currentLevelStartTime = Date.now() - savedPauseOffset;
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

            if (v.data.velocity[1] < 0) {
                v.data.velocity[1] += -speedIncreasePerLevel;
            } else {
                v.data.velocity[1] += speedIncreasePerLevel;
            }
        }
    };
};