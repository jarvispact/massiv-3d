import { UpdateableSystem } from '../core/system';
import { World } from '../core/world';
import { Transform } from '../components/transform';
import { WorldEvent } from '../core/event';
import { Entity } from '../core/entity';
export interface UpdateTransformSystem extends UpdateableSystem {
    transforms: Transform[];
}
export declare const UpdateTransformSystem: {
    new (world: World): {
        transforms: Transform[];
        onEvent(event: WorldEvent<Entity>): void;
        onUpdate(): void;
        world: World;
        cleanup?(): void;
    };
};
