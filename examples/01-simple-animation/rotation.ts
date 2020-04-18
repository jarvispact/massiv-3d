import { Component } from '../../src';
import { vec3 } from 'gl-matrix';

type Rotation = Component<'Rotation', vec3>;

const Rotation = class extends Component<'Rotation', vec3> {
    constructor() {
        super('Rotation', [0, 30, 0]);
    }
}

export default Rotation;