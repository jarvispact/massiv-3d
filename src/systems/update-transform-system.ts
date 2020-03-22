import { mat4 } from 'gl-matrix';
import { UpdateableSystem } from '../core/system';
import { World } from '../core/world';
import { Transform } from '../components/transform';
import { WorldEvent } from '../core/event';
import { Entity } from '../core/entity';

export interface UpdateTransformSystem extends UpdateableSystem {
    transforms: Transform[];
}

export const UpdateTransformSystem = class extends UpdateableSystem implements UpdateTransformSystem {
    transforms: Transform[];

    constructor(world: World) {
        super(world);
        world.subscribe(this, [WorldEvent.REGISTER_ENTITY, WorldEvent.REMOVE_ENTITY]);
        this.transforms = world.componentsByType.Transform as Transform[];
    }

    onEvent(event: WorldEvent): void {
        if (event.type === WorldEvent.REGISTER_ENTITY) {
            const transform = (event.payload as Entity).getComponent(Transform.TYPE);
            if (transform && !this.transforms.some(t => t === transform)) this.transforms.push(transform as Transform);
        } else if (event.type === WorldEvent.REMOVE_ENTITY) {
            const transform = (event.payload as Entity).getComponent(Transform.TYPE);
            if (transform) this.transforms = this.transforms.filter(t => t !== transform);
        }
    }

    onUpdate(): void {
        for (let i = 0; i < this.transforms.length; i++) {
            const t = this.transforms[i];
            if (t.data.dirty) {
                mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.position, t.data.scaling);
                this.transforms[i].data.dirty = false;
            }
        }
    }
}