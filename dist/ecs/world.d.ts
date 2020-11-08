import { Entity } from './entity';
import { System } from './system';
declare type StateChangeArgs<State, WorldAction> = {
    action: WorldAction;
    prevState: State;
    newState: State;
};
declare type StateChangeCallback<State, WorldAction> = (args: StateChangeArgs<State, WorldAction>) => void;
declare type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;
export declare class World<State extends Record<string, unknown>, WorldAction extends {
    type: string;
    payload?: unknown;
} = {
    type: string;
    payload?: unknown;
}> {
    private state;
    private reducer;
    private stateChangeSubscriber;
    private getDelta;
    private entities;
    private systems;
    private queryCache;
    constructor(args?: {
        initialState?: State;
        reducer?: Reducer<State, WorldAction>;
    });
    getState(): State;
    dispatch(action: WorldAction): this;
    onStateChange(callback: StateChangeCallback<State, WorldAction>): this;
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
