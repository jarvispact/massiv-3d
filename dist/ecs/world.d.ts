import { System } from './system';
import { Class } from '../types';
import { Component } from './component';
declare type SubscriberCallback<State, WorldAction> = (action: WorldAction, newState: State, prevState: State) => void;
declare type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;
export declare const worldActions: {
    addEntity: (entityName: string) => {
        readonly type: "ADD-ENTITY";
        readonly payload: string;
    };
    removeEntity: (entityName: string) => {
        readonly type: "REMOVE-ENTITY";
        readonly payload: string;
    };
    addComponent: <C extends Component<string, unknown>>(entityName: string, component: C) => {
        readonly type: "ADD-COMPONENT";
        readonly payload: {
            readonly entityName: string;
            readonly component: C;
        };
    };
    removeComponent: <C_1 extends Component<string, unknown>>(entityName: string, component: C_1) => {
        readonly type: "REMOVE-COMPONENT";
        readonly payload: {
            readonly entityName: string;
            readonly component: C_1;
        };
    };
};
declare const actionValues: ((entityName: string) => {
    readonly type: "ADD-ENTITY";
    readonly payload: string;
}) | ((entityName: string) => {
    readonly type: "REMOVE-ENTITY";
    readonly payload: string;
}) | (<C extends Component<string, unknown>>(entityName: string, component: C) => {
    readonly type: "ADD-COMPONENT";
    readonly payload: {
        readonly entityName: string;
        readonly component: C;
    };
}) | (<C_1 extends Component<string, unknown>>(entityName: string, component: C_1) => {
    readonly type: "REMOVE-COMPONENT";
    readonly payload: {
        readonly entityName: string;
        readonly component: C_1;
    };
});
declare type InternalAction = ReturnType<typeof actionValues>;
declare type GenericAction = {
    type: string;
    payload?: unknown;
};
export declare class World<State extends Record<string, unknown> = Record<string, unknown>, WorldAction extends GenericAction = InternalAction> {
    state: State;
    private reducer;
    private subscribers;
    private getDelta;
    private entities;
    private systems;
    constructor(args?: {
        initialState?: State;
        reducer?: Reducer<State, InternalAction | WorldAction>;
    });
    dispatch(action: InternalAction | WorldAction): this;
    subscribe(callback: SubscriberCallback<State, InternalAction | WorldAction>): this;
    addEntity<Comp extends Component>(name: string, components: Array<Comp>): this;
    removeEntity(name: string): this;
    addComponent(entityName: string, component: Component): this;
    removeComponent(entityName: string, componentType: string): this;
    getComponent<C extends Component>(entityName: string, componentType: string): C;
    getComponent<C extends Component>(entityName: string, klass: Class<C>): C;
    addSystem(system: System): this;
    removeSystem(system: System): this;
    update(time: number): this;
}
export {};
