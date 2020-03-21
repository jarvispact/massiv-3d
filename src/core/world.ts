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

export const World = class implements World {
    componentsByType: Record<string, Component[]> = {};
    componentsByEntityId: Record<string, Component[]> = {};
    updateableSystems: UpdateableSystem[] = [];

    registerEntity(components: Component[]): Entity {
        const entity = new Entity(this);
        if (!this.componentsByEntityId[entity.id]) this.componentsByEntityId[entity.id] = [];

        components.forEach(component => {
            if (!this.componentsByType[component.type]) this.componentsByType[component.type] = [];
            this.componentsByType[component.type].push(component);

            component.entityId = entity.id;
            this.componentsByEntityId[entity.id].push(component);
        });

        return entity;
    }

    removeEntity(entity: Entity): World {
        this.componentsByEntityId[entity.id] = [];

        Object.keys(this.componentsByType).forEach(type => {
            this.componentsByType[type] = this.componentsByType[type].filter(c => c.entityId !== entity.id);
        });

        return this;
    }

    registerSystem(SystemClass: SystemClass): World {
        const system = new SystemClass(this);

        if (system instanceof UpdateableSystem) {
            this.updateableSystems.push(system);
        }
        
        return this;
    }

    update(delta: number): void {
        this.updateableSystems.forEach((system) => system.onUpdate(delta));
    }
};