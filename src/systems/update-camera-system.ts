import { mat4 } from 'gl-matrix';
import { UpdateableSystem } from '../core/system';
import { World } from '../core/world';
import { WorldEvent } from '../core/event';
import { Entity } from '../core/entity';
import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';

export interface UpdateCameraSystem extends UpdateableSystem {
    activeCamera: OrthographicCamera | PerspectiveCamera | null;
}

export const UpdateCameraSystem = class extends UpdateableSystem implements UpdateCameraSystem {
    activeCamera: OrthographicCamera | PerspectiveCamera | null = null;

    constructor(world: World) {
        super(world);
        world.subscribe(this, [WorldEvent.SET_ACTIVE_CAMERA]);
        const orthographicCameras = world.componentsByType[OrthographicCamera.TYPE] as OrthographicCamera[];
        const perspectiveCameras = world.componentsByType[PerspectiveCamera.TYPE] as PerspectiveCamera[];
        if (orthographicCameras[0]) this.activeCamera = orthographicCameras[0];
        if (perspectiveCameras[0]) this.activeCamera = perspectiveCameras[0];
    }

    onEvent(event: WorldEvent<Entity>): void {
        if (event.type === WorldEvent.SET_ACTIVE_CAMERA) {
            const orthographicCamera = event.payload.getComponent(OrthographicCamera.TYPE) as OrthographicCamera;
            const perspectiveCamera = event.payload.getComponent(PerspectiveCamera.TYPE) as PerspectiveCamera;
            if (orthographicCamera) this.activeCamera = orthographicCamera;
            if (perspectiveCamera) this.activeCamera = perspectiveCamera;
        }
    }

    onUpdate(): void {
        const c = this.activeCamera;

        if (c && c.data.dirty.viewMatrix) {
            mat4.lookAt(c.data.viewMatrix, c.data.position, c.data.lookAt, c.data.upVector);
            c.data.dirty.viewMatrix = false;
        }

        if (c && c instanceof OrthographicCamera && c.data.dirty.projectionMatrix) {
            mat4.ortho(c.data.projectionMatrix, c.data.left, c.data.right, c.data.bottom, c.data.top, c.data.near, c.data.far);
            c.data.dirty.projectionMatrix = false;
        }

        if (c && c instanceof PerspectiveCamera && c.data.dirty.projectionMatrix) {
            mat4.perspective(c.data.projectionMatrix, c.data.fov, c.data.aspect, c.data.near, c.data.far);
            c.data.dirty.projectionMatrix = false;
        }
    }
}