import { System } from './system';
import { Class, Nullable } from '../types';
import { Component } from './component';
import { Entity } from './entity';

const createGetDelta = (then = 0) => (now: number): number => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

type SubscriberCallback<State, WorldAction> = (action: WorldAction, newState: State, prevState: State) => void;
type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;

const addEntity = (entityName: string) => ({ type: 'ADD-ENTITY', payload: entityName } as const);
const removeEntity = (entityName: string) => ({ type: 'REMOVE-ENTITY', payload: entityName } as const);
const addComponent = <C extends Component>(entityName: string, component: C) => ({ type: 'ADD-COMPONENT', payload: { entityName, component } } as const);
const removeComponent = <C extends Component>(entityName: string, component: C) => ({ type: 'REMOVE-COMPONENT', payload: { entityName, component } } as const);

export const worldActions = {
    addEntity,
    removeEntity,
    addComponent,
    removeComponent,
};

const actionValues = Object.values(worldActions)[0];
type InternalAction = ReturnType<typeof actionValues>;
type GenericAction = { type: string, payload?: unknown };

const defaultReducer = (state: unknown) => state;

export class World<
    State extends Record<string, unknown> = Record<string, unknown>,
    WorldAction extends GenericAction = InternalAction> {
    public state: State;
    private reducer: Reducer<State, InternalAction | WorldAction>;
    private subscribers: Array<SubscriberCallback<State, InternalAction | WorldAction>> = [];
    private getDelta = createGetDelta();
    private entities: Record<string, Nullable<Entity>> = {};
    private systems: System[] = [];

    constructor(args: { initialState?: State, reducer?: Reducer<State, InternalAction | WorldAction> } = {}) {
        this.state = args.initialState as State;
        this.reducer = args.reducer || defaultReducer as Reducer<State, InternalAction | WorldAction>;
    }

    dispatch(action: InternalAction | WorldAction) {
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

    addEntity<Comp extends Component>(name: string, components: Array<Comp>) {
        if (this.entities[name]) {
            throw new Error('a entity with the same name was already added to the world');
        }
        
        const entity = new Entity(name, components);
        this.entities[name] = entity;
        this.dispatch(worldActions.addEntity(name));
        return this;
    }

    removeEntity(name: string) {
        const entity = this.entities[name];
        if (!entity) return this;

        this.dispatch(worldActions.removeEntity(name));
        this.entities[name] = null;
        return this;
    }

    addComponent(entityName: string, component: Component) {
        const entity = this.entities[entityName];
        if (!entity) {
            throw new Error('a entity with this name was not added to the world');
        }

        const comp = entity.components[component.type];
        if (comp) {
            throw new Error('this entity already has a component of the same type');
        }

        entity.components[component.type] = component;
        this.dispatch(worldActions.addComponent(entityName, component));
        return this;
    }

    removeComponent(entityName: string, componentType: string) {
        const entity = this.entities[entityName];
        if (!entity) {
            throw new Error('a entity with this name was not added to the world');
        }

        const comp = entity.components[componentType];
        if (comp) {
            this.dispatch(worldActions.removeComponent(entityName, comp));
            entity.components[componentType] = null;
        }

        return this;
    }

    getComponent<C extends Component>(entityName: string, componentType: string): C;
    getComponent<C extends Component>(entityName: string, klass: Class<C>): C;
    getComponent<C extends Component>(entityName: string, klassOrType: unknown) {
        const entity = this.entities[entityName];
        if (!entity) return null;

        if (typeof klassOrType === 'string') return (entity.components[klassOrType] || null) as Nullable<C>;
        return (entity.components[(klassOrType as Class<C>).name] || null) as Nullable<C>;
    }

    addSystem(system: System) {
        this.systems.push(system);
        return this;
    }

    removeSystem(system: System) {
        this.systems = this.systems.filter(s => s !== system);
        return this;
    }

    update(time: number) {
        const delta = this.getDelta(time);

        for (let s = 0; s < this.systems.length; s++) {
            this.systems[s](delta, time);
        }

        return this;
    }
}