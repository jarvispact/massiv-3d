import { EasingFunction } from './easings';

export const createTween = (easingFunction: EasingFunction) => {
    let time = 0;
    let running = false;

    const start = () => {
        time = 0;
        running = true;
    };

    const update = (speed: number) => {
        time += speed;
        if (time >= 1) running = false;
    };

    const isRunning = () => running;
    const getValue = () => easingFunction(time);

    return {
        start,
        update,
        isRunning,
        getValue,
    };
};