import Entity from './entity';
import Component from '../components/component';

class World {
    constructor() {
        this.entities = [];
        this.components = [];
        this.systems = [];
        this.subscribers = [];
    }

    on(event, fn) {
        this.subscribers.push({ event, fn });
    }

    emit(event, ...args) {
        for (let i = 0; i < this.subscribers.length; i++) {
            const subscriber = this.subscribers[i];
            if (subscriber.event === event) subscriber.fn(...args);
        }
    }

    createEntity(components) {
        const entity = new Entity();
        this.entities.push(entity);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];

            if (component instanceof Component) {
                component.setEntityId(entity.id);
                this.components.push(component);
            } else {
                // eslint-disable-next-line no-console
                console.error('createEntity constructor only accepts instances of class: "Component"', { component, entity });
            }
        }

        return entity;
    }

    addSystem(system) {
        this.systems.push(system);
    }
}

export default World;
