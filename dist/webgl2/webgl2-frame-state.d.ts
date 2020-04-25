import { mat4 } from 'gl-matrix';
declare type MatrixCache = {
    modelView: mat4;
    modelViewProjection: mat4;
};
export declare class WebGL2FrameState {
    gl: WebGL2RenderingContext;
    blendEnabled: boolean;
    cullFaceEnabled: boolean;
    matrixCache: MatrixCache;
    constructor(gl: WebGL2RenderingContext);
    setBlendEnabled(flag: boolean): void;
    setCullFaceEnabled(flag: boolean): void;
}
export {};
