import { Component } from '../../../src';

export class Tag implements Component<'Tag', string> {
    type: 'Tag';
    data: string;

    constructor(name: string) {
        this.type = 'Tag';
        this.data = name;
    }
}