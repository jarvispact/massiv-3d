/* eslint-disable @typescript-eslint/no-empty-function */
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

type AnimationComponentArgs = {
    running?: boolean;
    easingFunction: (time: number) => number;
};

export const createAnimationComponent = (args: AnimationComponentArgs) => {
    const component = {
        type: 'Animation' as const,
        data: {
            running: args.running || false,
            time: 0,
            easingFunction: args.easingFunction,
        },
        start: () => {
            component.data.running = true;
            component.data.time = 0;
        },
        reset: () => {
            component.data.running = false;
            component.data.time = 0;
        },
        isRunning: () => component.data.running,
        updateTime: (t: number) => {
            if (!component.data.running) return;
            component.data.time += t;
            if (component.data.time > 1) component.reset();
        },
        getValue: () => component.data.easingFunction(component.data.time),
    };

    return component;
};

export type AnimationComponent = ReturnType<typeof createAnimationComponent>;

export const createAudioComponent = (filepaths: Record<string, string>): Component<'Audio', Record<string, HTMLAudioElement>> => {
    const data = Object.keys(filepaths).reduce((accum, name) => {
        accum[name] = new Audio(filepaths[name]);
        return accum;
    }, {} as Record<string, HTMLAudioElement>);

    return { type: 'Audio', data };
};
export type AudioComponent = ReturnType<typeof createAudioComponent>;
