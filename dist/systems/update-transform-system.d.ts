import { World } from '../core/world';
import { Transform } from '../components/transform';
export declare const UpdateTransformSystem: {
    new (world: World): {
        transforms: Transform[];
        onUpdate(delta: number): void;
        world: World;
    };
};
