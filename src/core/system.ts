import { World } from './world';
import { ECSEvent } from './event';

export interface System {
    world: World;
    on?(event: ECSEvent): void;
    update?(delta: number, time: number): void;
    cleanup?(): void;
}

export interface SystemClass {
    new(world: World): System;
}

export const System = class implements System {
    world: World;

    constructor(world: World) {
        this.world = world;
    }
}
