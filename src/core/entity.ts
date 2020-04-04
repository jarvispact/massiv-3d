import { World } from './world';
import uuid from '../utils/uuid';
import { Component } from './component';
import { Class } from '../types';

export class Entity {
    id: string;
    world: World;

    constructor(world: World) {
        this.id = uuid();
        this.world = world;
    }

    getComponents(): Component[] {
        return this.world.componentsByEntityId[this.id];
    }

    getComponent<T extends Component>(klass: Class<T>): T {
        return this.world.componentsByEntityId[this.id].find(c => c.type === klass.name) as T;
    }
}