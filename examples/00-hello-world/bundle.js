(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const WorldEvent = {
        REGISTER_ENTITY: 'RegisterEntityEvent',
        REMOVE_ENTITY: 'RemoveEntityEvent',
    };
    const createRegisterEntityEvent = (payload) => ({ type: WorldEvent.REGISTER_ENTITY, payload });
    const createRemoveEntityEvent = (payload) => ({ type: WorldEvent.REMOVE_ENTITY, payload });

    // https://gist.github.com/jcxplorer/823878
    var uuid = () => {
        let uuid = '';
        let i = 0;
        for (i; i < 32; i++) {
            const random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20)
                uuid += '-';
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    };

    const Entity = class {
        constructor(world) {
            this.world = world;
            this.id = uuid();
        }
        getComponents() {
            return this.world.componentsByEntityId[this.id];
        }
        getComponent(type) {
            return this.getComponents().find(c => c.type === type);
        }
    };

    const System = class {
        constructor(world) {
            this.world = world;
        }
    };
    const UpdateableSystem = class extends System {
        constructor(world) {
            super(world);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onUpdate(delta) {
            console.log('Method not implemented');
        }
    };

    const cleanupAndFilterSystem = (systemToRemove) => (system) => {
        if (system === systemToRemove) {
            if (system.cleanup)
                system.cleanup();
            return false;
        }
        return true;
    };
    const World = class {
        constructor() {
            this.componentsByType = {};
            this.componentsByEntityId = {};
            this.subscriptions = {};
            this.systems = [];
            this.updateableSystems = [];
        }
        publish(event) {
            if (!this.subscriptions[event.type])
                this.subscriptions[event.type] = [];
            for (let i = 0; i < this.subscriptions[event.type].length; i++) {
                const system = this.subscriptions[event.type][i];
                if (system.onEvent)
                    system.onEvent(event);
            }
        }
        subscribe(system, types) {
            types.forEach(type => {
                if (!this.subscriptions[type])
                    this.subscriptions[type] = [];
                this.subscriptions[type].push(system);
            });
        }
        registerEntity(components) {
            const entity = new Entity(this);
            if (!this.componentsByEntityId[entity.id])
                this.componentsByEntityId[entity.id] = [];
            components.forEach(component => {
                if (this.componentsByEntityId[entity.id].find(c => c.type === component.type)) {
                    throw new Error('a entity cannot have more than one component of the same type');
                }
                if (!this.componentsByType[component.type])
                    this.componentsByType[component.type] = [];
                this.componentsByType[component.type].push(component);
                component.entityId = entity.id;
                this.componentsByEntityId[entity.id].push(component);
            });
            this.publish(createRegisterEntityEvent(entity));
            return entity;
        }
        removeEntity(entity) {
            this.publish(createRemoveEntityEvent(entity));
            this.componentsByEntityId[entity.id] = [];
            Object.keys(this.componentsByType).forEach(type => {
                this.componentsByType[type] = this.componentsByType[type].filter(c => c.entityId !== entity.id);
            });
            return this;
        }
        registerSystem(SystemClass) {
            const system = new SystemClass(this);
            if (system instanceof UpdateableSystem) {
                this.updateableSystems.push(system);
            }
            else {
                this.systems.push(system);
            }
            return system;
        }
        removeSystem(system) {
            if (system instanceof UpdateableSystem) {
                this.updateableSystems = this.updateableSystems.filter(cleanupAndFilterSystem(system));
            }
            else {
                this.systems = this.systems.filter(cleanupAndFilterSystem(system));
            }
            return this;
        }
        update(delta) {
            this.updateableSystems.forEach((system) => system.onUpdate(delta));
        }
    };

    const world = new World();
    console.log('hello world');
    console.log(world);

})));
