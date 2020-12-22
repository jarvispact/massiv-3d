import { vec3 } from 'gl-matrix';
import { Component } from '../ecs/component';

type DirectionalLightData = {
    direction: vec3;
    diffuseColor: vec3;
    specularColor: vec3;
};

export class DirectionalLight implements Component<'DirectionalLight', DirectionalLightData> {
    type: 'DirectionalLight';
    data: DirectionalLightData;
    private dirty: boolean;

    constructor(args: Partial<DirectionalLightData> = {}) {
        this.type = 'DirectionalLight';
        this.data = {
            direction: args.direction || vec3.fromValues(3, 5, 1),
            diffuseColor: args.diffuseColor || vec3.fromValues(1, 1, 1),
            specularColor: args.specularColor || vec3.fromValues(1, 1, 1),
        };

        this.dirty = true;
    }

    setDiffuseColor(r: number, g: number, b: number) {
        this.data.diffuseColor[0] = r;
        this.data.diffuseColor[1] = g;
        this.data.diffuseColor[2] = b;
        this.dirty = true;
    }

    isDirty() {
        return this.dirty;
    }

    setDirty(dirty: boolean) {
        this.dirty = dirty;
        return this;
    }
}