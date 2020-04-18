import { System, Transform } from '../../src';
import Rotation from './rotation';

const RotationSystem = class extends System {
    update(delta: number): void {
        const rotation = this.world.getComponentsByType(Rotation);
        for (const r of rotation) {
            const t = this.world.getComponentByEntityIdAndType(r.entityId, Transform);
            t.rotate(r.data[0] * delta, r.data[1] * delta, r.data[2] * delta);
        }
    }
}

export default RotationSystem;