import { Component } from './component';
import { Entity } from './entity';
import { System, SystemClass } from './system';
import { ECSEvent } from './event';
import { Class } from '../types';

const cleanupAndFilterSystem = (systemToRemove: System) => (system: System): boolean => {
    if (system === systemToRemove && system.cleanup) {
        system.cleanup();
        return false;
    }
    return true;
}

const createGetDelta = (then = 0) => (now: number): number => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

export class World {
    componentsByType: Record<string, Component[]>;
    componentsByEntityId: Record<string, Component[]>;
    subscriptions: Record<string, System[]>;
    systems: System[];
    getDelta = createGetDelta();

    constructor() {
        this.componentsByType = {};
        this.componentsByEntityId = {};
        this.subscriptions = {};
        this.systems = [];
    }

    publish(event: ECSEvent): void {
        if (!this.subscriptions[event.type]) return;
        this.subscriptions[event.type].forEach((system) => system.on && system.on(event));
    }

    subscribe(system: System, types: string[]): void {
        types.forEach((type) => {
            if (!this.subscriptions[type]) this.subscriptions[type] = [];
            this.subscriptions[type].push(system);
        });
    }

    getComponentsByType<T extends Component>(klass: Class<T>): T[] {
        return this.componentsByType[klass.name] as T[];
    }

    getComponentsByEntityId(entityId: string): Component[] {
        return this.componentsByEntityId[entityId];
    }

    registerEntity(components: Component[]): Entity {
        const entity = new Entity(this);

        if (!this.componentsByEntityId[entity.id]) this.componentsByEntityId[entity.id] = [];

        components.forEach((component) => {
            component.entityId = entity.id;
            if (!this.componentsByType[component.type]) this.componentsByType[component.type] = [];
            this.componentsByType[component.type].push(component);
            this.componentsByEntityId[entity.id].push(component);
        });

        return entity;
    }

    removeEntity(entity: Entity): World {
        this.componentsByEntityId[entity.id] = [];
        Object.keys(this.componentsByType).forEach((type) => {
            this.componentsByType[type] = this.componentsByType[type].filter(c => c.entityId !== entity.id);
        });

        return this;
    }

    registerSystem(systemClass: SystemClass): System {
        const system = new systemClass(this);
        this.systems.push(system);
        return system;
    }

    removeSystem(system: System): World {
        this.systems = this.systems.filter(cleanupAndFilterSystem(system));
        return this;
    }

    update(time: number): void {
        const delta = this.getDelta(time);
        this.systems.forEach(system => system.update && system.update(delta, time));
    }
}