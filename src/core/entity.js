import uuid from '../utils/uuid';

class Entity {
    constructor() {
        this.id = uuid();
    }
}

export default Entity;
