import { System } from '../ecs/system';
import { World } from '../ecs/world';
declare type CameraControlArgs = {
    world: World;
    canvas: HTMLCanvasElement;
};
export declare const createTrackballCameraControlSystem: ({ world, canvas }: CameraControlArgs) => System;
export {};
