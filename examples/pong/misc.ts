import { vec3 } from 'gl-matrix';
import { Component, UBO } from '../../src';
import { PerspectiveCamera } from './camera/perspective-camera';

export const randomNegative = (val: number) => Math.round(Math.random()) === 0 ? -val : val;

export const createColorComponent = (r: number, g: number, b: number): Component<'Color', vec3> => ({ type: 'Color', data: vec3.fromValues(r, g, b) });
export type ColorComponent = ReturnType<typeof createColorComponent>;

export const getCameraUBOConfig = (camera: PerspectiveCamera) => ({
    'CameraUniforms.translation': { data: camera.translation },
    'CameraUniforms.viewMatrix': { data: camera.viewMatrix },
    'CameraUniforms.projectionMatrix': { data: camera.projectionMatrix },
});

export type CameraUBO = UBO<ReturnType<typeof getCameraUBOConfig>>;
