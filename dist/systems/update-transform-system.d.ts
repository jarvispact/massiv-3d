import { World } from '../core/world';
import { Transform } from '../components/transform';
export declare const UpdateTransformSystem: {
    new (world: World): {
        transforms: Transform[];
        onUpdate(): void;
        world: World;
        onEvent?(event: import("../core/event").WorldEvent): void;
    };
};
