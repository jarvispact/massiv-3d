import Entity from './entity';
import Component from '../components/component';
import AbstractMaterial from '../components/abstract-material';
import Geometry from '../components/geometry';
import Transform3D from '../components/transform-3d';
import AbstractCamera from '../components/abstract-camera';
import DirectionalLight from '../components/directional-light';

class World {
    constructor() {
        this.entities = [];
        this.components = [];
        this.systems = [];
        this.subscribers = [];

        this.componentsByType = {
            MATERIAL: [],
            TRANSFORM3D: [],
            GEOMETRY: [],
            CAMERA: [],
            DIRECTIONAL_LIGHT: [],
        };

        this.componentsByEntityId = {};
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
        const entity = new Entity(this);
        this.entities.push(entity);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];

            if (component instanceof Component) {
                component.setEntityId(entity.id);
                this.components.push(component);

                // duplicate data for faster access by entityId
                if (!this.componentsByEntityId[entity.id]) this.componentsByEntityId[entity.id] = [];
                this.componentsByEntityId[entity.id].push(component);

                // duplicate data for faster access by type
                if (component instanceof AbstractMaterial) this.componentsByType.MATERIAL.push(component);
                if (component instanceof Geometry) this.componentsByType.GEOMETRY.push(component);
                if (component instanceof Transform3D) this.componentsByType.TRANSFORM3D.push(component);
                if (component instanceof AbstractCamera) this.componentsByType.CAMERA.push(component);
                if (component instanceof DirectionalLight) this.componentsByType.DIRECTIONAL_LIGHT.push(component);
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

    update(delta) {
        for (let i = 0; i < this.systems.length; i++) {
            this.systems[i](this, delta);
        }
    }
}

export default World;
