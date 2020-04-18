import { RenderSystem } from '../core/system';

export class FpsDebugSystem extends RenderSystem {
    fpsDisplay: HTMLElement;
    oneSecond: number;
    fps: number;

    constructor() {
        super();
        this.fpsDisplay = document.createElement('p');
        this.fpsDisplay.style.position = 'fixed';
        this.fpsDisplay.style.top = '10px';
        this.fpsDisplay.style.left = '10px';
        this.fpsDisplay.style.color = '#FFFFFF';
        this.fpsDisplay.style.zIndex = '10';
        document.body.appendChild(this.fpsDisplay);
        this.oneSecond = Date.now() + 1000;
        this.fps = 0;
    }

    render(): void {
        this.fps++;
        const currentTime = Date.now();
        if (currentTime >= this.oneSecond) {
            this.fpsDisplay.textContent = `FPS: ${this.fps}`;
            this.fps = 0;
            this.oneSecond = currentTime + 1000;
        }
    }
}