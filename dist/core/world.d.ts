import { Component } from './component';
import { Entity } from './entity';
import { System, SystemClass } from './system';
import { ECSEvent } from './event';
import { Class } from '../types';
export declare class World {
    componentsByType: Record<string, Component[]>;
    componentsByEntityId: Record<string, Component[]>;
    subscriptions: Record<string, System[]>;
    systems: System[];
    getDelta: (now: number) => number;
    constructor();
    publish(event: ECSEvent): void;
    subscribe(system: System, types: string[]): void;
    getComponentsByType<T extends Component>(klass: Class<T>): T[];
    getComponentsByEntityId(entityId: string): Component[];
    registerEntity(components: Component[]): Entity;
    removeEntity(entity: Entity): World;
    registerSystem(systemClass: SystemClass): System;
    removeSystem(system: System): World;
    update(time: number): void;
}
