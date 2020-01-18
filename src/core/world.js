import { mat4 } from 'gl-matrix';
import Entity from './entity';
import Component from './component';

class World {
    constructor() {
        this.subscribers = [];

        this.componentsByType = Object.values(Component.types).reduce((accum, type) => {
            accum[type] = [];
            return accum;
        }, {});

        this.componentsByEntityId = {};
    }

    static get EVENTS() {
        return {
            INIT: 'INIT',
            UPDATE: 'UPDATE',
        };
    }

    on(event, fn) {
        this.subscribers.push({ event, fn });
    }

    emit(event, ...args) {
        for (let i = 0; i < this.subscribers.length; i++) {
            const subscriber = this.subscribers[i];
            if (subscriber.event === event) subscriber.fn(this, ...args);
        }
    }

    registerEntity(components) {
        const entity = Entity.create(this);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            component.entityId = entity.id;
            this.componentsByType[component.type].push(component);

            if (!Array.isArray(this.componentsByEntityId[entity.id])) this.componentsByEntityId[entity.id] = [];
            this.componentsByEntityId[entity.id].push(component);
        }

        return entity;
    }

    findComponentsByEntityId(entityId, typeFilters) {
        if (!typeFilters) return this.componentsByEntityId[entityId];
        return this.componentsByEntityId[entityId].filter(c => typeFilters.includes(c.type));
    }

    findComponentByEntityId(entityId, typeFilters) {
        return this.findComponentsByEntityId(entityId, typeFilters)[0];
    }

    findComponentsByType(type) {
        return this.componentsByType[type];
    }

    createDefaultCamera({ canvas, position = [0, 3, 5], lookAt = [0, 0, 0] } = {}) {
        const c = Component.createPerspectiveCamera({ aspect: canvas.clientWidth / canvas.clientHeight });
        const t = Component.createTransform3D({ position });
        const camera = this.registerEntity([c, t]);

        mat4.lookAt(c.viewMatrix, t.position, lookAt, c.upVector);
        mat4.perspective(c.projectionMatrix, c.fov, c.aspect, c.near, c.far);

        return camera;
    }

    run() {
        let then = 0;
        const getDelta = (now) => {
            now *= 0.001;
            const delta = now - then;
            then = now;
            return delta;
        };

        this.emit(World.EVENTS.INIT);

        const tick = (now) => {
            this.emit(World.EVENTS.UPDATE, getDelta(now));
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}

export default World;
