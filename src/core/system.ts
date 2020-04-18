import { World } from './world';
import { ECSEvent } from './event';

export interface System {
    world: World;
    init?(): void;
    on?(event: ECSEvent): void;
    cleanup?(): void;
    update(delta: number, time: number): void;
}

export class System implements System {
    world!: World;
}

export interface RenderSystem {
    world: World;
    init?(): void;
    on?(event: ECSEvent): void;
    cleanup?(): void;
    render(delta: number, time: number): void;
}

export class RenderSystem implements RenderSystem {
    world!: World;
}