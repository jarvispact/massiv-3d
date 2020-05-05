import { Component } from '../core/component';
import { vec3 } from 'gl-matrix';

const type = 'DirectionalLight';

type Args = {
    direction: vec3;
    color?: vec3;
    intensity?: number;
};

type DirectionalLightData = {
    direction: vec3;
    color: vec3;
    intensity: number;
    webglDirty: {
        direction: boolean;
        color: boolean;
        intensity: boolean;
    };
};

export class DirectionalLight extends Component<typeof type, DirectionalLightData> {
    constructor(args: Args) {
        super(type, {
            direction: args.direction,
            color: args.color || vec3.fromValues(1, 1, 1),
            intensity: args.intensity || 1,
            webglDirty: {
                direction: true,
                color: true,
                intensity: true,
            },
        });
    }

    setDirection(x: number, y: number, z: number): void {
        this.data.direction[0] = x;
        this.data.direction[1] = y;
        this.data.direction[2] = z;
        this.data.webglDirty.direction = true;
    }

    setColor(r: number, g: number, b: number): void {
        this.data.direction[0] = r;
        this.data.direction[1] = g;
        this.data.direction[2] = b;
        this.data.webglDirty.color = true;
    }

    setIntensity(intensity: number): void {
        this.data.intensity = intensity;
        this.data.webglDirty.intensity = true;
    }

    resetWebglDirtyFlags(): void {
        this.data.webglDirty.direction = false;
        this.data.webglDirty.color = false;
        this.data.webglDirty.intensity = false;
    }
}