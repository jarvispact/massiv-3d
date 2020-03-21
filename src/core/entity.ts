import { World } from './world';
import { Component } from './component';
import uuid from '../utils/uuid';

export interface Entity {
    id: string;
    world: World;
    getComponents(): Component[];
    getComponent(type: string): Component | undefined;
}

export const Entity = class implements Entity {
    id: string;
    world: World;

    constructor(world: World) {
        this.world = world;
        this.id = uuid();
    }

    getComponents(): Component[] {
        return this.world.componentsByEntityId[this.id];
    }

    getComponent(type: string): Component | undefined {
        return this.getComponents().find(c => c.type === type);
    }
}