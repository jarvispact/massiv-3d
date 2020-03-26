import { UpdateableSystem } from '../core/system';
import { World } from '../core/world';
import { WorldEvent } from '../core/event';
import { Entity } from '../core/entity';
import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
export interface UpdateCameraSystem extends UpdateableSystem {
    activeCamera: OrthographicCamera | PerspectiveCamera | null;
}
export declare const UpdateCameraSystem: {
    new (world: World): {
        activeCamera: OrthographicCamera | PerspectiveCamera | null;
        onEvent(event: WorldEvent<Entity>): void;
        onUpdate(): void;
        world: World;
        cleanup?(): void;
    };
};
