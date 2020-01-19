import { mat4 } from 'gl-matrix';
import Entity from './entity';
import Component from './component';
import InputManager from './input-manager';
import System from './system';

const createGetDelta = (then = 0) => (now) => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

class World {
    constructor() {
        this.systems = [];

        this.componentsByType = Object.values(Component.types).reduce((accum, type) => {
            accum[type] = [];
            return accum;
        }, {});

        this.componentsByEntityId = {};
        this.inputManager = null;
    }

    registerEntity(components) {
        const entity = Entity.create(this);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            component.entityId = entity.id;
            if (!this.componentsByType[component.type]) this.componentsByType[component.type] = [];
            this.componentsByType[component.type].push(component);

            if (!Array.isArray(this.componentsByEntityId[entity.id])) this.componentsByEntityId[entity.id] = [];
            this.componentsByEntityId[entity.id].push(component);
        }

        return entity;
    }

    registerSystem(system) {
        this.systems.push(system);
    }

    registerInputManager(canvas) {
        this.inputManager = new InputManager(canvas);
        return this.inputManager;
    }

    getInputManager() {
        return this.inputManager;
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

    step() {
        System.updateTransform(this);
        System.updatePerspectiveCamera(this);
        for (let i = 0; i < this.systems.length; i++) this.systems[i](this);
    }

    run() {
        const getDelta = createGetDelta();

        System.updateTransform(this);
        System.updatePerspectiveCamera(this);

        const tick = (now) => {
            for (let i = 0; i < this.systems.length; i++) this.systems[i](this, getDelta(now));
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}

export default World;
