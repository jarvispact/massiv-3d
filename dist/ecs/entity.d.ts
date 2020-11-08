import { Component } from './component';
export declare const createEntity: <Name extends string, Comp extends Component<string, unknown>>(name: Name, _components: Comp[]) => {
    name: Name;
    addComponent: <C extends Comp>(component: C) => void;
    removeComponent: <T extends string>(type: T | Comp["type"]) => void;
    getComponent: <T_1 extends string>(type: Comp["type"] | T_1) => Comp | undefined;
    getComponentTypes: () => string[];
};
export declare type Entity = ReturnType<typeof createEntity>;
