import { vec3 } from 'gl-matrix';
import { Component } from '../../src';

export type MaterialData = {
    color: vec3;
};

export const Material = class extends Component<'Material', MaterialData> {
    constructor(data: MaterialData) {
        super('Material', data);
    }
}