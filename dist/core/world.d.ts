import { Component } from './component';
import { Entity } from './entity';
import { System, RenderSystem } from './system';
import { ECSEvent } from './event';
import { Class } from '../types';
declare type WorldOptions = {
    transformAutoUpdate?: boolean;
    cameraAutoUpdate?: boolean;
};
export declare class World {
    options: WorldOptions;
    componentsByType: Record<string, Component[]>;
    componentsByEntityId: Record<string, Component[]>;
    subscriptions: Record<string, (System | RenderSystem)[]>;
    systems: System[];
    renderSystems: RenderSystem[];
    getDelta: (now: number) => number;
    constructor(options?: WorldOptions);
    publish(event: ECSEvent): void;
    subscribe<T extends Class<ECSEvent>[]>(system: System | RenderSystem, events: T): void;
    getComponentsByType<T extends Component>(klass: Class<T>): T[];
    getComponentsByEntityId(entityId: string): Component[];
    getComponentByEntityIdAndType<T extends Component>(entityId: string, klass: Class<T>): T;
    registerEntity(components: Component[]): Entity;
    removeEntity(entity: Entity): World;
    registerSystem(system: System): World;
    removeSystem(system: System): World;
    registerRenderSystem(renderSystem: RenderSystem): World;
    removeRenderSystem(system: RenderSystem): World;
    update(time: number): void;
    render(time: number): void;
}
export {};
