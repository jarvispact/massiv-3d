import { World } from './world';
import { ECSEvent } from './event';
export declare class System {
    world: World;
    init?(): void;
    on?(event: ECSEvent): void;
    cleanup?(): void;
    update(delta: number, time: number): void;
}
export declare class RenderSystem {
    world: World;
    init?(): void;
    on?(event: ECSEvent): void;
    cleanup?(): void;
    render(delta: number, time: number): void;
}
