import { Component } from './component';
import { SystemClass, UpdateableSystem } from './system';
import { Entity } from './entity';
export interface World {
    componentsByType: Record<string, Component[]>;
    componentsByEntityId: Record<string, Component[]>;
    updateableSystems: UpdateableSystem[];
    registerEntity(components: Component[]): Entity;
    removeEntity(entity: Entity): World;
    registerSystem(systemClass: SystemClass): World;
    update(delta: number): void;
}
export declare const World: {
    new (): {
        componentsByType: Record<string, Component[]>;
        componentsByEntityId: Record<string, Component[]>;
        updateableSystems: UpdateableSystem[];
        registerEntity(components: Component[]): Entity;
        registerEntity(components: Component[]): Entity;
        removeEntity(entity: Entity): World;
        removeEntity(entity: Entity): World;
        registerSystem(SystemClass: SystemClass): World;
        registerSystem(systemClass: SystemClass): World;
        update(delta: number): void;
        update(delta: number): void;
    };
};
