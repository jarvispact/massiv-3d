import { Class } from '../types';
import { Component } from './component';
export declare class Entity<Name extends string = string, Comp extends Component = Component> {
    name: Name;
    private components;
    private componentTypes;
    constructor(name: Name, components: Array<Comp>);
    getComponentByType<T extends string>(type: Comp['type'] | T): Comp | undefined;
    getComponentByClass<C extends Comp>(klass: Class<C>): C;
    getComponentTypes(): Comp["type"][];
    getComponents(): Array<Comp>;
    addComponent(component: Comp): this;
    removeComponent(component: Comp): this;
    removeComponentByType<T extends string>(type: Comp['type'] | T): this;
    removeComponentByClass<C extends Comp>(component: Class<C>): this;
    hasComponents<T extends string>(types: Array<Comp['type']> | Array<T>): boolean;
}
