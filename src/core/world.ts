import { Component } from './component';
import { SystemClass, UpdateableSystem, System } from './system';
import { Entity } from './entity';
import { WorldEvent, createRegisterEntityEvent, createRemoveEntityEvent, createSetActiveCameraEvent } from './event';

const cleanupAndFilterSystem = (systemToRemove: System) => (system: System): boolean => {
    if (system === systemToRemove) {
        if (system.cleanup) system.cleanup();
        return false;
    }
    return true;
}

export interface World {
    componentsByType: Record<string, Component[]>;
    componentsByEntityId: Record<string, Component[]>;
    subscriptions: Record<string, System[]>;
    systems: System[];
    updateableSystems: UpdateableSystem[];
    activeCameraEntity: Entity | null;
    publish(event: WorldEvent): void;
    subscribe(system: System, types: string[]): void;
    registerEntity(components: Component[]): Entity;
    removeEntity(entity: Entity): World;
    registerSystem(systemClass: SystemClass): System;
    removeSystem(system: System): World;
    setActiveCameraEntity(cameraEntity: Entity): World;
    update(delta: number): void;
}

export const World = class implements World {
    componentsByType: Record<string, Component[]> = {};
    componentsByEntityId: Record<string, Component[]> = {};
    subscriptions: Record<string, System[]> = {};
    systems: System[] = [];
    updateableSystems: UpdateableSystem[] = [];
    activeCameraEntity: Entity | null = null;

    publish(event: WorldEvent): void {
        if (!this.subscriptions[event.type]) this.subscriptions[event.type] = [];

        for (let i = 0; i < this.subscriptions[event.type].length; i++) {
            const system = this.subscriptions[event.type][i];
            if (system.onEvent) system.onEvent(event);
        }
    }

    subscribe(system: System, types: string[]): void {
        types.forEach(type => {
            if (!this.subscriptions[type]) this.subscriptions[type] = [];
            this.subscriptions[type].push(system);
        });
    }

    registerEntity(components: Component[]): Entity {
        const entity = new Entity(this);
        if (!this.componentsByEntityId[entity.id]) this.componentsByEntityId[entity.id] = [];

        components.forEach(component => {
            if (this.componentsByEntityId[entity.id].find(c => c.type === component.type)) {
                throw new Error('a entity cannot have more than one component of the same type');
            }

            if (!this.componentsByType[component.type]) this.componentsByType[component.type] = [];
            this.componentsByType[component.type].push(component);

            component.entityId = entity.id;
            this.componentsByEntityId[entity.id].push(component);
        });

        this.publish(createRegisterEntityEvent(entity));
        return entity;
    }

    removeEntity(entity: Entity): World {
        this.publish(createRemoveEntityEvent(entity));
        this.componentsByEntityId[entity.id] = [];

        Object.keys(this.componentsByType).forEach(type => {
            this.componentsByType[type] = this.componentsByType[type].filter(c => c.entityId !== entity.id);
        });

        return this;
    }

    registerSystem(SystemClass: SystemClass): System {
        const system = new SystemClass(this);

        if (system instanceof UpdateableSystem) {
            this.updateableSystems.push(system);
        } else {
            this.systems.push(system);
        }
        
        return system;
    }

    removeSystem(system: System): World {
        if (system instanceof UpdateableSystem) {
            this.updateableSystems = this.updateableSystems.filter(cleanupAndFilterSystem(system));
        } else {
            this.systems = this.systems.filter(cleanupAndFilterSystem(system));
        }

        return this;
    }

    setActiveCameraEntity(cameraEntity: Entity): World {
        this.activeCameraEntity = cameraEntity;
        this.publish(createSetActiveCameraEvent(cameraEntity));
        return this;
    }

    update(delta: number): void {
        this.updateableSystems.forEach((system) => system.onUpdate(delta));
    }
};