import { Component } from './component';
import { Entity } from './entity';
import { System, RenderSystem } from './system';
import { ECSEvent } from './event';
import { Class } from '../types';

const cleanupAndFilterSystem = (systemToRemove: System | RenderSystem) => (system: System | RenderSystem): boolean => {
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
    subscriptions: Record<string, (System | RenderSystem)[]>;
    systems: System[];
    renderSystems: RenderSystem[];
    getDelta = createGetDelta();

    constructor() {
        this.componentsByType = {};
        this.componentsByEntityId = {};
        this.subscriptions = {};
        this.systems = [];
        this.renderSystems = [];
    }

    publish(event: ECSEvent): void {
        if (!this.subscriptions[event.type]) return;
        this.subscriptions[event.type].forEach((system) => system.on && system.on(event));
    }

    subscribe<T extends Class<ECSEvent>[]>(system: System | RenderSystem, events: T): void {
        events.forEach((event) => {
            if (!this.subscriptions[event.name]) this.subscriptions[event.name] = [];
            this.subscriptions[event.name].push(system);
        });
    }

    getComponentsByType<T extends Component>(klass: Class<T>): T[] {
        if (!this.componentsByType[klass.name]) return [];
        return this.componentsByType[klass.name] as T[];
    }

    getComponentsByEntityId(entityId: string): Component[] {
        return this.componentsByEntityId[entityId] || [];
    }

    getComponentByEntityIdAndType<T extends Component>(entityId: string, klass: Class<T>): T {
        return this.getComponentsByEntityId(entityId).find(c => c.type === klass.name) as T;
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

    registerSystem(system: System): World {
        system.world = this;
        if (system.init) system.init();
        this.systems.push(system);
        return this;
    }

    removeSystem(system: System): World {
        this.systems = this.systems.filter(cleanupAndFilterSystem(system));
        return this;
    }

    registerRenderSystem(renderSystem: RenderSystem): World {
        renderSystem.world = this;
        if (renderSystem.init) renderSystem.init();
        this.renderSystems.push(renderSystem);
        return this;
    }

    removeRenderSystem(system: RenderSystem): World {
        this.renderSystems = this.renderSystems.filter(cleanupAndFilterSystem(system));
        return this;
    }

    update(time: number): void {
        const delta = this.getDelta(time);
        for (let i = 0; i < this.systems.length; i++) this.systems[i].update(delta, time);
    }

    render(time: number): void {
        const delta = this.getDelta(time);
        for (let i = 0; i < this.renderSystems.length; i++) this.renderSystems[i].render(delta, time);
    }
}