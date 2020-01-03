import Component from '../core/component';

// Abstract Class

class Material extends Component {
    constructor(indices) {
        super();
        this.indices = indices || [];
    }

    getIndices() {
        return this.indices;
    }

    getIndicesAsUint32Array() {
        return new Uint32Array(this.indices);
    }

    setIndices(indices) {
        this.indices = indices;
        return this;
    }
}

export default Material;
