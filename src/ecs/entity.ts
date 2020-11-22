import { Class } from '../types';
import { intersection } from '../utils/intersection';
import { Component } from './component';

const hasMoreThanOneComponentsOfSameType = (componentTypes: string[]) => [...new Set(componentTypes)].length < componentTypes.length;

export class Entity<Name extends string = string, Comp extends Component = Component> {
    name: Name;
    private components: Record<string, Comp | undefined>;
    private componentTypes: Array<Comp['type']>;

    constructor(name: Name, components: Array<Comp>) {
        this.name = name;
        this.componentTypes = components.map(c => c.type);

        this.components = components.reduce((accum, comp) => {
            accum[comp.type] = comp;
            return accum;
        }, {} as Record<string, Comp>);

        if (hasMoreThanOneComponentsOfSameType(this.componentTypes)) {
            throw new Error('a entity can only one component of any type');
        }
    }

    getComponentByType<T extends string>(type: Comp['type'] | T) {
        return this.components[type];
    }

    getComponentByClass<C extends Comp>(klass: Class<C>): C {
        return this.components[klass.name] as C;
    }

    getComponentTypes() {
        return this.componentTypes;
    }

    getComponents(): Array<Comp> {
        return Object.values(this.components).filter(Boolean) as Array<Comp>;
    }

    addComponent(component: Comp) {
        if (this.componentTypes.includes(component.type)) {
            throw new Error('a entity can only one component of any type');
        }

        this.components[component.type as string] = component;
        this.componentTypes.push(component.type);
        return this;
    }

    removeComponent(component: Comp) {
        this.components[component.type] = undefined;
        this.componentTypes = this.componentTypes.filter(t => t !== component.type);
        return this;
    }

    removeComponentByType<T extends string>(type: Comp['type'] | T) {
        const comp = this.getComponentByType(type);
        if (comp) this.removeComponent(comp);
        return this;
    }

    removeComponentByClass<C extends Comp>(component: Class<C>) {
        const comp = this.getComponentByType(component.constructor.name);
        if (comp) this.removeComponent(comp);
        return this;
    }

    hasComponents<T extends string>(types: Array<Comp['type']> | Array<T>) {
        return intersection(types, this.getComponentTypes()).length === types.length;
    }
}
