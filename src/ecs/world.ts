import { Entity } from './entity';
import { intersection } from '../utils/intersection';
import { System } from './system';
import { Nullable } from '../types';

const createGetDelta = (then = 0) => (now: number): number => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

type SubscriberCallback<State, WorldAction> = (action: WorldAction, newState: State, prevState: State) => void;
type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;

const addEntity = <E extends Entity>(entity: E) => ({ type: 'ADD-ENTITY', payload: entity } as const);
const removeEntity = <E extends Entity>(entity: E) => ({ type: 'REMOVE-ENTITY', payload: entity } as const);

export const worldActions = {
    addEntity,
    removeEntity,
};

const actionValues = Object.values(worldActions)[0];
type InternalAction = ReturnType<typeof actionValues>;
type GenericAction = { type: string, payload?: unknown };

export class World<
    State extends Record<string, unknown> = Record<string, unknown>,
    WorldAction extends GenericAction = GenericAction> {
    public state: State;
    private reducer: Reducer<State, InternalAction | WorldAction>;
    private subscribers: Array<SubscriberCallback<State, InternalAction | WorldAction>> = [];
    private getDelta = createGetDelta();
    private entities: Array<Entity> = [];
    private entitiesByName: Record<string, Nullable<Entity>> = {};
    private systems: System[] = [];
    private queryCache: Entity[] = [];

    constructor(args: { initialState?: State, reducer?: Reducer<State, InternalAction | WorldAction> } = {}) {
        this.state = args.initialState as State;
        this.reducer = args.reducer as Reducer<State, InternalAction | WorldAction>;
    }

    dispatch(action: InternalAction | WorldAction) {
        if (!this.state || !this.reducer) return this;
        const newState = this.reducer(this.state, action);
        
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i](action, newState, this.state);
        }

        this.state = newState;
        return this;
    }

    subscribe(callback: SubscriberCallback<State, InternalAction | WorldAction>) {
        this.subscribers.push(callback);
        return this;
    }

    getEntity(entityName: string) {
        return this.entitiesByName[entityName];
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
        this.entitiesByName[entity.name] = entity;
        this.dispatch(worldActions.addEntity(entity));
        return this;
    }

    removeEntity(entity: Entity) {
        this.entities = this.entities.filter(e => e !== entity);
        this.entitiesByName[entity.name] = null;
        this.dispatch(worldActions.removeEntity(entity));
        return this;
    }

    removeEntityByName(entityName: string) {
        const entity = this.getEntity(entityName);
        if (entity) this.removeEntity(entity);
        return this;
    }

    addSystem(system: System) {
        this.systems.push(system);
        return this;
    }

    removeSystem(system: System) {
        this.systems = this.systems.filter(s => s !== system);
        return this;
    }

    queryEntities(requiredComponents: string[]) {
        this.queryCache.length = 0;

        for (let e = 0; e < this.entities.length; e++) {
            const entity = this.entities[e];
            if (intersection(requiredComponents, entity.getComponentTypes()).length === requiredComponents.length) {
                this.queryCache.push(entity);
            }
        }

        return this.queryCache;
    }

    update(time: number) {
        const delta = this.getDelta(time);

        for (let s = 0; s < this.systems.length; s++) {
            this.systems[s](delta, time);
        }

        return this;
    }
}