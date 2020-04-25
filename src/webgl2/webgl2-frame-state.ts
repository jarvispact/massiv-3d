import { mat4 } from 'gl-matrix';

type MatrixCache = {
    modelView: mat4;
    modelViewProjection: mat4;
};

export class WebGL2FrameState {
    gl: WebGL2RenderingContext;
    blendEnabled: boolean;
    cullFaceEnabled: boolean;
    matrixCache: MatrixCache;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.blendEnabled = gl.isEnabled(gl.BLEND);
        this.cullFaceEnabled = gl.isEnabled(gl.CULL_FACE);

        this.matrixCache = {
            modelView: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            modelViewProjection: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
        };
    }

    setBlendEnabled(flag: boolean): void {
        const gl = this.gl;

        if (this.blendEnabled !== flag) {
            this.blendEnabled = flag;
            if (this.blendEnabled) {
                gl.enable(gl.BLEND);
            } else {
                gl.disable(gl.BLEND);
            }
        }
    }

    setCullFaceEnabled(flag: boolean): void {
        const gl = this.gl;

        if (this.cullFaceEnabled !== flag) {
            this.cullFaceEnabled = flag;
            if (this.cullFaceEnabled) {
                gl.enable(gl.CULL_FACE);
            } else {
                gl.disable(gl.CULL_FACE);
            }
        }
    }
}