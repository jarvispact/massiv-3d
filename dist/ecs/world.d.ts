import { Entity } from './entity';
import { System } from './system';
export declare class World {
    private getDelta;
    private entities;
    private systems;
    private queryCache;
    addEntity(entity: Entity): this;
    removeEntity(entity: Entity): this;
    removeEntityByName(entityName: string): this;
    addSystem(system: System): this;
    removeSystem(system: System): this;
    queryEntities(requiredComponents: string[]): Entity<string, import("./component").Component<string, unknown>[]>[];
    update(time: number): this;
}
