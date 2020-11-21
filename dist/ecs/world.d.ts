import { Entity } from './entity';
import { System } from './system';
import { Nullable } from '../types';
declare type SubscriberCallback<State, WorldAction> = (action: WorldAction, newState: State, prevState: State) => void;
declare type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;
export declare const worldActions: {
    addEntity: <E extends Entity<string, import("./component").Component<string, unknown>>>(entity: E) => {
        readonly type: "ADD-ENTITY";
        readonly payload: E;
    };
    removeEntity: <E_1 extends Entity<string, import("./component").Component<string, unknown>>>(entity: E_1) => {
        readonly type: "REMOVE-ENTITY";
        readonly payload: E_1;
    };
};
declare const actionValues: (<E extends Entity<string, import("./component").Component<string, unknown>>>(entity: E) => {
    readonly type: "ADD-ENTITY";
    readonly payload: E;
}) | (<E_1 extends Entity<string, import("./component").Component<string, unknown>>>(entity: E_1) => {
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
    getEntity(entityName: string): Nullable<Entity<string, import("./component").Component<string, unknown>>>;
    addEntity(entity: Entity): this;
    removeEntity(entity: Entity): this;
    removeEntityByName(entityName: string): this;
    addSystem(system: System): this;
    removeSystem(system: System): this;
    queryEntities(requiredComponents: string[]): Entity<string, import("./component").Component<string, unknown>>[];
    update(time: number): this;
}
export {};
