import uuid from '../utils/uuid';

class Component {
    constructor(entityId) {
        this.id = uuid();
        this.entityId = entityId || null;
    }

    getEntityId() {
        return this.entityId;
    }

    setEntityId(newEntityId) {
        this.entityId = newEntityId;
    }
}

export default Component;
