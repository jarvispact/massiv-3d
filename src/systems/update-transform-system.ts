import { UpdateableSystem } from '../core/system';
import { World } from '../core/world';
import { Transform } from '../components/transform';

export const UpdateTransformSystem = class extends UpdateableSystem {
    transforms: Transform[];

    constructor(world: World) {
        super(world);
        this.transforms = [];
    }

    onUpdate(delta: number): void {
        console.log(`onUpdate: ${delta}`);
    }
}