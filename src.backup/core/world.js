import Transform from '../components/transform';
import Camera from '../components/camera';
import Renderable from '../components/renderable';
import DirectionalLight from '../components/directional-light';
import createGetDelta from '../utils/create-get-delta';

const updateCameraSystem = (_, world) => {
    const cameras = world.getComponentsByType('Camera');
    const iMax = cameras.length;
    for (let i = 0; i < iMax; i++) cameras[i].update();
};

const updateTransformSystem = (_, world) => {
    const transforms = world.getComponentsByType('Transform');
    const iMax = transforms.length;
    for (let i = 0; i < iMax; i++) transforms[i].update();
};

const defaultOptions = {
    cameraAutoUpdate: true,
    transformAutoUpdate: true,
};

const World = class {
    constructor(options = {}) {
        this.options = { ...defaultOptions, ...options };
        this.entities = [];
        this.subscribers = [];

        this.componentCache = {
            byEntityId: {},
            byType: {
                [Transform.name]: [],
                [Camera.name]: [],
                [Renderable.name]: [],
                [DirectionalLight.name]: [],
            },
        };

        if (this.options.cameraAutoUpdate) {
            this.on(World.EVENT.UPDATE, updateCameraSystem);
        }

        if (this.options.transformAutoUpdate) {
            this.on(World.EVENT.UPDATE, updateTransformSystem);
        }
    }

    static get EVENT() {
        return {
            REGISTER_ENTITY: 'register-entity',
            REMOVE_ENTITY: 'remove-entity',
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
                this.componentCache.byType.Transform.push(component);
            }

            if (component instanceof Camera) {
                this.componentCache.byType.Camera.push(component);
            }

            if (component instanceof Renderable) {
                this.componentCache.byType.Renderable.push(component);
            }

            if (component instanceof DirectionalLight) {
                this.componentCache.byType.DirectionalLight.push(component);
            }
        }

        this.emit(World.EVENT.REGISTER_ENTITY, entity);
        return this;
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
        this.componentCache.byEntityId[entity.id] = [];
        this.componentCache.byType.Transform = this.componentCache.byType.Transform.filter(c => c.entityId !== entity.id);
        this.componentCache.byType.Camera = this.componentCache.byType.Camera.filter(c => c.entityId !== entity.id);
        this.componentCache.byType.Renderable = this.componentCache.byType.Renderable.filter(c => c.entityId !== entity.id);
        this.componentCache.byType.DirectionalLight = this.componentCache.byType.DirectionalLight.filter(c => c.entityId !== entity.id);

        this.emit(World.EVENT.REMOVE_ENTITY, entity);
        return this;
    }

    removeEntityById(entityId) {
        const entity = this.entities.find(e => e.id === entityId);
        if (entity) this.removeEntity(entity);
        return this;
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

    step() {
        this.emit(World.EVENT.UPDATE, 0.016, this);
        this.emit(World.EVENT.RENDER, this);
        return this;
    }

    run() {
        const getDelta = createGetDelta();

        const tick = (now) => {
            requestAnimationFrame(tick);
            this.emit(World.EVENT.UPDATE, getDelta(now), this);
            this.emit(World.EVENT.RENDER, this);
        };

        requestAnimationFrame(tick);
        return this;
    }
};

export default World;
