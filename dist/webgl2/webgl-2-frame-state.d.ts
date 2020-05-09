import { mat4, mat3 } from 'gl-matrix';
import { DirectionalLight } from '../components/directional-light';
declare type MatrixCache = {
    modelView: mat4;
    modelViewProjection: mat4;
    normal: mat3;
};
declare type DirectionalLightCache = {
    count: number;
    directions: number[];
    colors: number[];
    intensities: number[];
    countNeedsUpdate: boolean;
    directionsNeedsUpdate: boolean;
    colorsNeedsUpdate: boolean;
    intensitiesNeedsUpdate: boolean;
};
export declare class WebGL2FrameState {
    gl: WebGL2RenderingContext;
    blendEnabled: boolean;
    cullFaceEnabled: boolean;
    matrixCache: MatrixCache;
    dirLightCache: DirectionalLightCache;
    constructor(gl: WebGL2RenderingContext);
    setBlendEnabled(flag: boolean): void;
    setCullFaceEnabled(flag: boolean): void;
    cacheDirectionalLights(dirLights: DirectionalLight[]): void;
}
export {};
