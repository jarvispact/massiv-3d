import uuid from '../utils/uuid';

const Entity = class {
    constructor(components) {
        this.id = uuid();
        this.components = components || [];
        this.components.forEach(component => component.setEntityId(this.id));
    }

    getComponentByType(type) {
        return this.components.find(c => c.constructor.name === type);
    }
};

export default Entity;
