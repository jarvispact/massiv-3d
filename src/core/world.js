import ComponentTypes from '../components/component-types';

const createGetDelta = (then = 0) => (now) => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

class World {
    constructor() {
        this.subscribers = [];
        this.componentsByEntityId = {};

        this.componentsByType = Object.values(ComponentTypes).reduce((accum, type) => {
            accum[type] = [];
            return accum;
        }, {});
    }

    static get PHASE() {
        return {
            UPDATE: 'update',
            RENDER: 'render',
        };
    }

    on(event, handler) {
        this.subscribers.push({ event, handler });
        return this;
    }

    emit(event, ...data) {
        for (let s = 0; s < this.subscribers.length; s++) {
            const subscriber = this.subscribers[s];
            if (subscriber.event === event) subscriber.handler(...data);
        }
        return this;
    }

    registerEntity(entity) {
        if (!this.componentsByEntityId[entity.id]) this.componentsByEntityId[entity.id] = [];

        const allComponents = entity.getComponents();
        for (let c = 0; c < allComponents.length; c++) {
            this.componentsByEntityId[entity.id].push(allComponents[c]);
        }

        const types = Object.values(ComponentTypes);
        for (let t = 0; t < types.length; t++) {
            const type = types[t];
            if (!this.componentsByType[type]) this.componentsByType[type] = [];

            const components = entity.getComponents(type);
            this.componentsByType[type].push(...components);
        }

        return this;
    }

    registerEntities(entities) {
        for (let e = 0; e < entities.length; e++) {
            this.registerEntity(entities[e]);
        }
        return this;
    }

    getComponentsByType(type) {
        return this.componentsByType[type];
    }

    getComponentsByEntityId(entityId) {
        return this.componentsByEntityId[entityId];
    }

    step() {
        this.emit(World.PHASE.UPDATE, 0, this);
        this.emit(World.PHASE.RENDER, this);
        return this;
    }

    run() {
        const getDelta = createGetDelta();

        const tick = (now) => {
            this.emit(World.PHASE.UPDATE, getDelta(now), this);
            this.emit(World.PHASE.RENDER, this);
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        return this;
    }
}

export default World;
