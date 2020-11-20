import { Entity } from './entity';
import { System } from './system';
import { Nullable } from '../types';
declare type SubscriberCallback<State, WorldAction> = (action: WorldAction, newState: State, prevState: State) => void;
declare type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;
export declare const worldActions: {
    addEntity: <E extends {
        name: string;
        addComponent: <C extends import("./component").Component<string, unknown>>(component: C) => void;
        removeComponent: <T extends string>(type: string | T) => void;
        getComponent: <T_1 extends string>(type: string | T_1) => import("./component").Component<string, unknown> | undefined;
        getComponentTypes: () => string[];
    }>(entity: E) => {
        readonly type: "ADD-ENTITY";
        readonly payload: E;
    };
    removeEntity: <E_1 extends {
        name: string;
        addComponent: <C extends import("./component").Component<string, unknown>>(component: C) => void;
        removeComponent: <T extends string>(type: string | T) => void;
        getComponent: <T_1 extends string>(type: string | T_1) => import("./component").Component<string, unknown> | undefined;
        getComponentTypes: () => string[];
    }>(entity: E_1) => {
        readonly type: "REMOVE-ENTITY";
        readonly payload: E_1;
    };
};
declare const actionValues: (<E extends {
    name: string;
    addComponent: <C extends import("./component").Component<string, unknown>>(component: C) => void;
    removeComponent: <T extends string>(type: string | T) => void;
    getComponent: <T_1 extends string>(type: string | T_1) => import("./component").Component<string, unknown> | undefined;
    getComponentTypes: () => string[];
}>(entity: E) => {
    readonly type: "ADD-ENTITY";
    readonly payload: E;
}) | (<E_1 extends {
    name: string;
    addComponent: <C extends import("./component").Component<string, unknown>>(component: C) => void;
    removeComponent: <T extends string>(type: string | T) => void;
    getComponent: <T_1 extends string>(type: string | T_1) => import("./component").Component<string, unknown> | undefined;
    getComponentTypes: () => string[];
}>(entity: E_1) => {
    readonly type: "REMOVE-ENTITY";
    readonly payload: E_1;
});
declare type InternalAction = ReturnType<typeof actionValues>;
declare type GenericAction = {
    type: string;
    payload?: unknown;
};
export declare class World<State extends Record<string, unknown> = Record<string, unknown>, WorldAction extends GenericAction = GenericAction> {
    state: State;
    private reducer;
    private subscribers;
    private getDelta;
    private entities;
    private entitiesByName;
    private systems;
    private queryCache;
    constructor(args?: {
        initialState?: State;
        reducer?: Reducer<State, InternalAction | WorldAction>;
    });
    dispatch(action: InternalAction | WorldAction): this;
    subscribe(callback: SubscriberCallback<State, InternalAction | WorldAction>): this;
    getEntity(entityName: string): Nullable<{
        name: string;
        addComponent: <C extends import("./component").Component<string, unknown>>(component: C) => void;
        removeComponent: <T extends string>(type: string | T) => void;
        getComponent: <T_1 extends string>(type: string | T_1) => import("./component").Component<string, unknown> | undefined;
        getComponentTypes: () => string[];
    }>;
    addEntity(entity: Entity): this;
    removeEntity(entity: Entity): this;
    removeEntityByName(entityName: string): this;
    addSystem(system: System): this;
    removeSystem(system: System): this;
    queryEntities(requiredComponents: string[]): {
        name: string;
        addComponent: <C extends import("./component").Component<string, unknown>>(component: C) => void;
        removeComponent: <T extends string>(type: string | T) => void;
        getComponent: <T_1 extends string>(type: string | T_1) => import("./component").Component<string, unknown> | undefined;
        getComponentTypes: () => string[];
    }[];
    update(time: number): this;
}
export {};
