import { World } from './world';
export interface System {
    world: World;
}
export interface SystemClass {
    new (world: World): System | UpdateableSystem;
}
export declare const System: {
    new (world: World): {
        world: World;
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
    };
};
