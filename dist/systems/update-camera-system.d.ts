import { System } from '../core/system';
import { ResizeCanvasEvent } from '../events/resize-canvas-event';
export declare class UpdateCameraSystem extends System {
    init(): void;
    on(event: ResizeCanvasEvent): void;
    update(): void;
}
