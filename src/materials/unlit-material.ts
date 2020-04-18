import { Material } from '../core/material';
import { vec3 } from 'gl-matrix';

type Args = {
    color?: vec3;
    opacity?: number;
};

export class UnlitMaterial extends Material {
    color: vec3;
    opacity: number;

    constructor(args: Args = {}) {
        super();
        this.color = args.color || [1, 1, 1];
        this.opacity = args.opacity || 1.0;
    }
}