import uuid from '../utils/uuid';

class Entity {
    constructor(world) {
        this.id = uuid();
        this.world = world;
    }

    getComponents() {
        return this.world.componentsByEntityId[this.id];
    }
}

export default Entity;
