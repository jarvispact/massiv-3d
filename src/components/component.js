const Component = class {
    constructor(data) {
        this.entityId = null;
        if (data) Object.keys(data).forEach(key => this[key] = data[key]);
    }

    getEntityId() {
        return this.entityId;
    }

    setEntityId(entityId) {
        this.entityId = entityId;
        return this;
    }
};

export default Component;
