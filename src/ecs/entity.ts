import { Component } from './component';

export class Entity<Name extends string = string, Comp extends Component = Component> {
    name: Name;
    components: Record<string, Comp | null>;

    constructor(name: Name, components: Array<Comp>) {
        this.name = name;
        this.components = components.reduce((accum, comp) => {
            accum[comp.type] = comp;
            return accum;
        }, {} as Record<string, Comp>);
    }
}