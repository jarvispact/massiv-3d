import { vec3 } from 'gl-matrix';
import { Component } from '../../src';

export const randomNegative = (val: number) => Math.round(Math.random()) === 0 ? -val : val;

export const createColorComponent = (r: number, g: number, b: number): Component<'Color', vec3> => ({ type: 'Color', data: vec3.fromValues(r, g, b) });
export type ColorComponent = ReturnType<typeof createColorComponent>;
