import { ECSEvent } from '../core/event';
import { Entity } from '../core/entity';

const type = 'RegisterEntityEvent';

export class RegisterEntityEvent extends ECSEvent<typeof type, Entity> {
    constructor(entity: Entity) {
        super(type, entity);
    }
}