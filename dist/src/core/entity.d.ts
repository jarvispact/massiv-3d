import { World } from './world';
import { Component } from './component';
export interface Entity {
    id: string;
    world: World;
    getComponents(): Component[];
    getComponent(type: string): Component | undefined;
}
export declare const Entity: {
    new (world: World): {
        id: string;
        world: World;
        getComponents(): Component[];
        getComponents(): Component[];
        getComponent(type: string): Component | undefined;
        getComponent(type: string): Component | undefined;
    };
};
