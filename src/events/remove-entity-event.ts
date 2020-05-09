import { ECSEvent } from '../core/event';
import { Entity } from '../core/entity';

const type = 'RemoveEntityEvent';

export class RemoveEntityEvent extends ECSEvent<typeof type, Entity> {
    constructor(entity: Entity) {
        super(type, entity);
    }
}