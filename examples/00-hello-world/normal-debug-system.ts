import { System } from '../../src';
import Renderable from './renderable';

export class NormalDebugSystem extends System {
    gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        super();
        this.gl = gl;
    }

    update(): void {
        const renderables = this.world.getComponentsByType(Renderable);
    }
}