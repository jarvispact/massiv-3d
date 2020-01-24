import Component from './component';
import uuid from '../utils/uuid';

const createGetDelta = (then = 0) => (now) => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

class World {
    constructor() {
        this.systems = [];
        this.componentsByEntityId = {};

        this.componentsByType = Object.values(Component.types).reduce((accum, type) => {
            accum[type] = [];
            return accum;
        }, {});
    }

    registerEntity(components) {
        const entityId = uuid();

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            component.entityId = entityId;
            if (!this.componentsByType[component.type]) this.componentsByType[component.type] = [];
            this.componentsByType[component.type].push(component);

            if (!Array.isArray(this.componentsByEntityId[entityId])) this.componentsByEntityId[entityId] = [];
            this.componentsByEntityId[entityId].push(component);
        }

        return entityId;
    }

    registerSystem(system) {
        this.systems.push(system);
    }

    step() {
        for (let i = 0; i < this.systems.length; i++) {
            this.systems[i](0, this);
        }
    }

    run() {
        const getDelta = createGetDelta();

        const tick = (now) => {
            for (let i = 0; i < this.systems.length; i++) {
                this.systems[i](getDelta(now), this);
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}

export default World;
