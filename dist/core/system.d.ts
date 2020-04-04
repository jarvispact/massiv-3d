import { World } from './world';
import { ECSEvent } from './event';
export interface System {
    world: World;
    on?(event: ECSEvent): void;
    update?(delta: number, time: number): void;
    cleanup?(): void;
}
export interface SystemClass {
    new (world: World): System;
}
export declare const System: {
    new (world: World): {
        world: World;
        on?(event: ECSEvent<string, unknown>): void;
        update?(delta: number, time: number): void;
        cleanup?(): void;
    };
};
