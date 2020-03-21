import { Component } from './component';
import { SystemClass, UpdateableSystem, System } from './system';
import { Entity } from './entity';
import { WorldEvent } from './event';
export interface World {
    componentsByType: Record<string, Component[]>;
    componentsByEntityId: Record<string, Component[]>;
    subscriptions: Record<string, System[]>;
    systems: System[];
    updateableSystems: UpdateableSystem[];
    publish(event: WorldEvent): void;
    subscribe(system: System, types: string[]): void;
    registerEntity(components: Component[]): Entity;
    removeEntity(entity: Entity): World;
    registerSystem(systemClass: SystemClass): System;
    removeSystem(system: System): World;
    update(delta: number): void;
}
export declare const World: {
    new (): {
        componentsByType: Record<string, Component[]>;
        componentsByEntityId: Record<string, Component[]>;
        subscriptions: Record<string, System[]>;
        systems: System[];
        updateableSystems: UpdateableSystem[];
        publish(event: WorldEvent): void;
        publish(event: WorldEvent): void;
        subscribe(system: System, types: string[]): void;
        subscribe(system: System, types: string[]): void;
        registerEntity(components: Component[]): Entity;
        registerEntity(components: Component[]): Entity;
        removeEntity(entity: Entity): World;
        removeEntity(entity: Entity): World;
        registerSystem(SystemClass: SystemClass): System;
        registerSystem(systemClass: SystemClass): System;
        removeSystem(system: System): World;
        removeSystem(system: System): World;
        update(delta: number): void;
        update(delta: number): void;
    };
};
