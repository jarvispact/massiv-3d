import { World } from './world';
import { WorldEvent } from './event';
export interface System {
    world: World;
    onEvent?(event: WorldEvent): void;
    cleanup?(): void;
}
export interface SystemClass {
    new (world: World): System | UpdateableSystem;
}
export declare const System: {
    new (world: World): {
        world: World;
        onEvent?(event: WorldEvent): void;
        cleanup?(): void;
    };
};
export interface UpdateableSystem extends System {
    onUpdate(delta: number): void;
}
export declare const UpdateableSystem: {
    new (world: World): {
        onUpdate(delta: number): void;
        onUpdate(delta: number): void;
        world: World;
        onEvent?(event: WorldEvent): void;
        cleanup?(): void;
    };
};
