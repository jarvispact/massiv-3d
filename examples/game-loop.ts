import { World } from '../src';

const frameTimes: number[] = [];
let oneSecond = Date.now() + 1000;
let fps = 0;

export const runGameLoop = (world: World) => {
    const tick = (now: number) => {
        const before = Date.now();
        world.update(now);
        const after = Date.now();
        frameTimes.push(after - before);
        fps++;
    
        if (Date.now() > oneSecond) {
            const avgFrameTime = (frameTimes.reduce((accum, frameTime) => accum + frameTime, 0) / frameTimes.length).toFixed(2);
            console.log(`fps: ${fps} | avg frame time: ${avgFrameTime}`);
            frameTimes.length = 0;
            fps = 0;
            oneSecond = Date.now() + 1000;
        }
    
        requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
};

// export const runGameLoop = (world: World) => {
//     const tick = (now: number) => {
//         world.update(now);
//         requestAnimationFrame(tick);
//     };
    
//     requestAnimationFrame(tick);
// };