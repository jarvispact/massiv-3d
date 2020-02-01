import uuid from '../utils/uuid';

class Entity {
    constructor(components) {
        this.id = uuid();
        this.components = components || [];
        this.components.forEach(c => c.setEntityId(this.id));
    }

    getComponents(type) {
        return type ? this.components.filter(c => c.type === type) : this.components;
    }

    getComponent(type) {
        return this.getComponents(type)[0];
    }

    addComponent(component) {
        component.setEntityId(this.id);
        this.components.push(component);
        return this;
    }

    removeComponent(component) {
        component.setEntityId(null);
        this.components.filter(c => c !== component);
        return this;
    }
}

export default Entity;
