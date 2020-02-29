import Transform from '../components/transform';
import Camera from '../components/camera';
import Renderable from '../components/renderable';
import DirectionalLight from '../components/directional-light';
import createGetDelta from '../utils/create-get-delta';

const World = class {
    constructor() {
        this.entities = [];
        this.subscribers = [];

        this.componentCache = {
            byEntityId: {},
            byType: {
                transform: [],
                camera: [],
                renderable: [],
                dirLight: [],
            },
        };
    }

    static get PHASE() {
        return {
            UPDATE: 'update',
            RENDER: 'render',
        };
    }

    registerEntity(entity) {
        this.entities.push(entity);

        if (!Array.isArray(this.componentCache.byEntityId[entity.id])) {
            this.componentCache.byEntityId[entity.id] = [];
        }

        for (let i = 0; i < entity.components.length; i++) {
            const component = entity.components[i];

            this.componentCache.byEntityId[entity.id].push(component);

            if (component instanceof Transform) {
                this.componentCache.byType.transform.push(component);
            }

            if (component instanceof Camera) {
                this.componentCache.byType.camera.push(component);
            }

            if (component instanceof Renderable) {
                this.componentCache.byType.renderable.push(component);
            }

            if (component instanceof DirectionalLight) {
                this.componentCache.byType.dirLight.push(component);
            }
        }

        return this;
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
        this.componentCache.byEntityId[entity.id] = [];
        this.componentCache.byType.transform = this.componentCache.byType.transform.filter(c => c.entityId !== entity.id);
        this.componentCache.byType.camera = this.componentCache.byType.camera.filter(c => c.entityId !== entity.id);
        this.componentCache.byType.renderable = this.componentCache.byType.renderable.filter(c => c.entityId !== entity.id);
        this.componentCache.byType.dirLight = this.componentCache.byType.dirLight.filter(c => c.entityId !== entity.id);
    }

    removeEntityById(entityId) {
        const entity = this.entities.find(e => e.id === entityId);
        if (entity) this.removeEntity(entity);
    }

    hasEntity(entity) {
        return !!this.entities.find(e => e === entity);
    }

    registerEntities(entities) {
        entities.forEach(e => this.registerEntity(e));
        return this;
    }

    getComponentsByType(type) {
        return this.componentCache.byType[type];
    }

    getComponentByType(type) {
        return this.getComponentsByType(type)[0];
    }

    getComponentsByEntityId(entityId) {
        return this.componentCache.byEntityId[entityId];
    }

    on(phase, handler) {
        this.subscribers.push({ phase, handler });
        return this;
    }

    emit(phase, ...data) {
        for (let s = 0; s < this.subscribers.length; s++) {
            const subscriber = this.subscribers[s];
            if (subscriber.phase === phase) subscriber.handler(...data);
        }
        return this;
    }

    step() {
        this.emit(World.PHASE.UPDATE, 0.016, this);
        this.emit(World.PHASE.RENDER, this);
        return this;
    }

    run() {
        const getDelta = createGetDelta();

        const tick = (now) => {
            requestAnimationFrame(tick);
            this.emit(World.PHASE.UPDATE, getDelta(now), this);
            this.emit(World.PHASE.RENDER, this);
        };

        requestAnimationFrame(tick);
        return this;
    }
};

export default World;
