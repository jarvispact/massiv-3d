import { vec3, mat4 } from 'gl-matrix';
import { Component } from '../core/component';

interface Arguments {
    position: vec3;
    lookAt?: vec3;
    upVector?: vec3;

    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
}

export interface OrthographicCameraData {
    position: vec3;
    lookAt: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    dirty: {
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };

    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;
}

export interface OrthographicCamera extends Component {
    data: OrthographicCameraData;
    translate(translation: vec3): void;
}

const OrthographicCameraType = 'OrthographicCamera';

export const OrthographicCamera = class implements OrthographicCamera {
    entityId!: string;
    type = OrthographicCameraType;
    data: OrthographicCameraData;

    constructor(data: Arguments) {
        this.data = {
            position: data.position,
            lookAt: data.lookAt ? data.lookAt : [0, 0, 0],
            upVector: data.upVector ? data.upVector : [0, 1, 0],
            viewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            projectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            dirty: {
                viewMatrix: true,
                projectionMatrix: true,
            },

            left: data.left,
            right: data.right,
            bottom: data.bottom,
            top: data.top,
            near: data.near,
            far: data.far,
        };
    }

    static get TYPE(): string {
        return OrthographicCameraType;
    }

    translate(translation: vec3): void {
        vec3.add(this.data.position, this.data.position, translation);
        this.data.dirty.viewMatrix = true;
    }
};
