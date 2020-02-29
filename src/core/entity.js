import uuid from '../utils/uuid';

const Entity = class {
    constructor(components) {
        this.id = uuid();
        this.components = components || [];
        this.components.forEach(component => component.setEntityId(this.id));
    }

    getComponentByClass(klass) {
        return this.components.find(c => c instanceof klass);
    }
};

export default Entity;
