import { Component } from '../../../src';

type MaterialData = {
    diffuseMap: HTMLImageElement;
}

export class Material implements Component<'Material', MaterialData> {
    type: 'Material';
    data: MaterialData;

    constructor(data: MaterialData) {
        this.type = 'Material';
        this.data = data;
    }
}