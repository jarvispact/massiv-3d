import Component from './component';

class Renderable extends Component {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

export default Renderable;
