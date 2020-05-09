import { mat4 } from 'gl-matrix';
import { System } from '../core/system';
import { PerspectiveCamera } from '../components/perspective-camera';
import { OrthographicCamera } from '../components/orthographic-camera';
import { ResizeCanvasEvent } from '../events/resize-canvas-event';

export class UpdateCameraSystem extends System {
    init(): void {
        this.world.subscribe(this, [ResizeCanvasEvent]);
    }

    on(event: ResizeCanvasEvent): void {
        const perspectiveCameras = this.world.getComponentsByType(PerspectiveCamera);
        for (let i = 0; i < perspectiveCameras.length; i++) {
            const c = perspectiveCameras[i];
            c.setAspect(event.payload.width / event.payload.height);
        }

        this.update();
    }

    update(): void {
        const perspectiveCameras = this.world.getComponentsByType(PerspectiveCamera);
        const orthographicCameras = this.world.getComponentsByType(OrthographicCamera);

        for (let i = 0; i < perspectiveCameras.length; i++) {
            const c = perspectiveCameras[i];
            if (c.data.dirty.viewMatrix) {
                mat4.lookAt(c.data.viewMatrix, c.data.translation, c.data.lookAt, c.data.upVector);
                c.data.dirty.viewMatrix = false;
            }
        
            if (c.data.dirty.projectionMatrix) {
                mat4.perspective(c.data.projectionMatrix, c.data.fov, c.data.aspect, c.data.near, c.data.far);
                c.data.dirty.projectionMatrix = false;
            }
        }

        for (let i = 0; i < orthographicCameras.length; i++) {
            const c = orthographicCameras[i];
            if (c.data.dirty.viewMatrix) {
                mat4.lookAt(c.data.viewMatrix, c.data.translation, c.data.lookAt, c.data.upVector);
                c.data.dirty.viewMatrix = false;
            }
        
            if (c.data.dirty.projectionMatrix) {
                mat4.ortho(c.data.projectionMatrix, c.data.left, c.data.right, c.data.bottom, c.data.top, c.data.near, c.data.far);
                c.data.dirty.projectionMatrix = false;
            }
        }
    }
}