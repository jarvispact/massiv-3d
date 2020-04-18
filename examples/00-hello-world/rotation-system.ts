import { System, Transform } from '../../src';
import Rotation from './rotation';

const RotationSystem = class extends System {
    update(delta: number): void {
        const transforms = this.world.getComponentsByType(Transform);
        for (const t of transforms) {
            const rotation = this.world.getComponentByEntityIdAndType(t.entityId, Rotation);
            t.rotate([rotation.data[0] * delta, rotation.data[1] * delta, rotation.data[2] * delta]);
        }
    }
}

export default RotationSystem;