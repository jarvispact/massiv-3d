import { System } from '../core/system';
import { Transform } from '../components/transform';

export class UpdateTransformSystem extends System {
    update(): void {
        const transforms = this.world.getComponentsByType(Transform);
        for (let i = 0; i < transforms.length; i++) transforms[i].update();
    }
}