import { System } from '../core/system';
import { World } from '../core/world';
export declare class FpsDebugSystem extends System {
    fpsDisplay: HTMLElement;
    oneSecond: number;
    fps: number;
    constructor(world: World);
    update(): void;
}
