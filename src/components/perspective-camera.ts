import { vec3, mat4 } from 'gl-matrix';
import { Component } from '../core/component';

interface Arguments {
    position: vec3;
    lookAt?: vec3;
    upVector?: vec3;

    fov?: number;
    aspect: number;
    near?: number;
    far?: number;
}

export interface PerspectiveCameraData {
    position: vec3;
    lookAt: vec3;
    upVector: vec3;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    dirty: {
        viewMatrix: boolean;
        projectionMatrix: boolean;
    };

    fov: number;
    aspect: number;
    near: number;
    far: number;
}

export interface PerspectiveCamera extends Component {
    data: PerspectiveCameraData;
    translate(translation: vec3): void;
}

const PerspectiveCameraType = 'PerspectiveCamera';

export const PerspectiveCamera = class implements PerspectiveCamera {
    entityId!: string;
    type = PerspectiveCameraType;
    data: PerspectiveCameraData;

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

            fov: data.fov || 45,
            aspect: data.aspect,
            near: data.near || 0.1,
            far: data.far || 1000,
        };
    }

    static get TYPE(): string {
        return PerspectiveCameraType;
    }

    translate(translation: vec3): void {
        vec3.add(this.data.position, this.data.position, translation);
        this.data.dirty.viewMatrix = true;
    }

    setAspect(aspect: number): void {
        this.data.aspect = aspect;
        this.data.dirty.projectionMatrix = true;
    }
};
