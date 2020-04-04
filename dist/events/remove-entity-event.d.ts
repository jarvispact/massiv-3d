import { ECSEvent } from '../core/event';
import { Entity } from '../core/entity';
declare const type = "RemoveEntityEvent";
export declare class RemoveEntityEvent extends ECSEvent<typeof type, Entity> {
    constructor(entity: Entity);
}
export {};
