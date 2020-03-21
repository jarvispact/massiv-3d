import { UpdateableSystem } from '../core/system';
import { World } from '../core/world';
import { Transform } from '../components/transform';
import { mat4 } from 'gl-matrix';

export const UpdateTransformSystem = class extends UpdateableSystem {
    transforms: Transform[];

    constructor(world: World) {
        super(world);
        this.transforms = world.componentsByType.Transform as Transform[];
    }

    onUpdate(): void {
        for (let i = 0; i < this.transforms.length; i++) {
            const t = this.transforms[i];
            if (t.data.dirty) {
                console.log('update');
                mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.position, t.data.scaling);
                this.transforms[i].data.dirty = false;
            }
        }
    }
}