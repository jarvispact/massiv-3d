import { World } from './world';
import { Component } from './component';
import { Class } from '../types';
export declare class Entity {
    id: string;
    world: World;
    constructor(world: World);
    getComponents(): Component[];
    getComponent<T extends Component>(klass: Class<T>): T;
}
