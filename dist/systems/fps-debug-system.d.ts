import { RenderSystem } from '../core/system';
export declare class FpsDebugSystem extends RenderSystem {
    fpsDisplay: HTMLElement;
    oneSecond: number;
    fps: number;
    constructor();
    render(): void;
}
