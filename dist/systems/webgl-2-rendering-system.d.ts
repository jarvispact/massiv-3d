import { System } from '../ecs/system';
import { World } from '../ecs/world';
declare type Webgl2RenderingSystemArgs = {
    world: World;
    canvas: HTMLCanvasElement;
    maxDirectionalLights?: number;
};
export declare const createWebgl2RenderingSystem: ({ world, canvas, maxDirectionalLights }: Webgl2RenderingSystemArgs) => System;
export {};
