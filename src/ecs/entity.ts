import { Class } from '../types';
import { Component } from './component';

// TODO: maybe a Record is better than a Array (faster access and less memory footprint)

const hasMoreThanOneComponentsOfSameType = (componentTypes: string[]) => [...new Set(componentTypes)].length < componentTypes.length;

export class Entity<Name extends string = string, Components extends Array<Component<string, unknown>> = Array<Component<string, unknown>>> {
    name: Name;
    components: Components;
    componentTypes: Array<string>;

    constructor(name: Name, components: Components) {
        this.name = name;
        this.components = components;
        this.componentTypes = components.map(c => c.type);

        if (hasMoreThanOneComponentsOfSameType(this.componentTypes)) {
            throw new Error('a entity can only one component of any type');
        }
    }

    addComponent(component: Components[number]) {
        this.components.push(component);
        this.componentTypes.push(component.type);

        if (hasMoreThanOneComponentsOfSameType(this.componentTypes)) {
            throw new Error('a entity can only one component of any type');
        }

        return this;
    }

    removeComponent(component: Components[number]) {
        this.components = this.components.filter(c => c !== component) as Components;
        this.componentTypes = this.componentTypes.filter(c => c !== component.type);
        return this;
    }

    removeComponentByType(type: string) {
        this.components = this.components.filter(c => c.type !== type) as Components;
        this.componentTypes = this.componentTypes.filter(c => c !== type);
        return this;
    }

    getComponent<T extends Components[number]>(klass: Class<T>) {
        return this.components.find(c => c.constructor.name === klass.name) as T;
    }
}