import { ECSEvent } from '../core/event';
import { Entity } from '../core/entity';
declare const type = "RegisterEntityEvent";
export declare class RegisterEntityEvent extends ECSEvent<typeof type, Entity> {
    constructor(entity: Entity);
}
export {};
