import { System } from '../../src';

export class NormalDebugSystem extends System {
    gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        super();
        this.gl = gl;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update(): void {}
}