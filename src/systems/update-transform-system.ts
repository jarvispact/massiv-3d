import { mat4 } from 'gl-matrix';
import { System } from '../core/system';
import { Transform } from '../components/transform';

export class UpdateTransformSystem extends System {
    update(): void {
        const transforms = this.world.getComponentsByType(Transform);
        for (let i = 0; i < transforms.length; i++) {
            const t = transforms[i];
            if (t.data.dirty.modelMatrix) {
                mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.translation, t.data.scaling);
                t.data.dirty.modelMatrix = false;
            }
        }
    }
}