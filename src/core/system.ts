/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import { World } from './world';
import { ECSEvent } from './event';

export class System {
    world!: World;
    init?(): void;
    on?(event: ECSEvent): void;
    cleanup?(): void;
    update(delta: number, time: number): void {}
}

export class RenderSystem {
    world!: World;
    init?(): void;
    on?(event: ECSEvent): void;
    cleanup?(): void;
    render(delta: number, time: number): void {}
}