import { Class } from '../types';
import { Component } from './component';
export declare class Entity<Name extends string = string, Components extends Array<Component<string, unknown>> = Array<Component<string, unknown>>> {
    name: Name;
    components: Components;
    componentTypes: Array<string>;
    constructor(name: Name, components: Components);
    addComponent(component: Components[number]): this;
    removeComponent(component: Components[number]): this;
    removeComponentByType(type: string): this;
    getComponent<T extends Components[number]>(klass: Class<T>): T;
    getComponentByType<T extends string>(type: T | Components[number]['type']): Component<string, unknown> | undefined;
}
