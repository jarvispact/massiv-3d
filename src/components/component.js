class Component {
    constructor(type) {
        this.type = type;
        this.entityId = null;
    }

    getType() {
        return this.type;
    }

    getEntityId() {
        return this.entityId;
    }

    setEntityId(entityId) {
        this.entityId = entityId;
    }
}

export default Component;
