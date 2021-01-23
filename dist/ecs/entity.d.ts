import { Component } from './component';
export declare class Entity<Name extends string = string, Comp extends Component = Component> {
    name: Name;
    components: Record<string, Comp | null>;
    constructor(name: Name, components: Array<Comp>);
}
