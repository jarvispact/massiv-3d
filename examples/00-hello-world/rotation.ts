import { Component } from '../../src';
import { vec3 } from 'gl-matrix';

const rotationType = 'Rotation';

type Rotation = Component<typeof rotationType, vec3>;

const Rotation = class extends Component<typeof rotationType, vec3> {
    constructor() {
        super(rotationType, [0, 20, 0]);
    }
}

export default Rotation;