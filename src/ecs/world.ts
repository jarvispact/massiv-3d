import { Entity } from './entity';
import { intersection } from '../utils/intersection';
import { System } from './system';

const createGetDelta = (then = 0) => (now: number): number => {
    now *= 0.001;
    const delta = now - then;
    then = now;
    return delta;
};

type StateChangeArgs<State, WorldAction> = { action: WorldAction, prevState: State, newState: State };
type StateChangeCallback<State, WorldAction> = (args: StateChangeArgs<State, WorldAction>) => void;
type Reducer<State, WorldAction> = (state: State, action: WorldAction) => State;

export class World<
    State extends Record<string, unknown>,
    WorldAction extends { type: string, payload?: unknown } = { type: string, payload?: unknown }> {
    private state: State;
    private reducer: Reducer<State, WorldAction>;
    private stateChangeSubscriber: Array<StateChangeCallback<State, WorldAction>> = [];
    private getDelta = createGetDelta();
    private entities: Array<Entity> = [];
    private systems: System[] = [];
    private queryCache: Entity[] = [];

    constructor(args: { initialState?: State, reducer?: Reducer<State, WorldAction> } = {}) {
        this.state = args.initialState as State;
        this.reducer = args.reducer as Reducer<State, WorldAction>;
    }

    getState() {
        return this.state;
    }

    dispatch(action: WorldAction) {
        if (!this.state || !this.reducer) return this;
        const newState = this.reducer(this.state, action);
        
        for (let i = 0; i < this.stateChangeSubscriber.length; i++) {
            this.stateChangeSubscriber[i]({ action, prevState: this.state, newState });
        }

        this.state = newState;
        return this;
    }

    onStateChange(callback: StateChangeCallback<State, WorldAction>) {
        this.stateChangeSubscriber.push(callback);
        return this;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
        return this;
    }

    removeEntity(entity: Entity) {
        this.entities = this.entities.filter(e => e !== entity);
        return this;
    }

    removeEntityByName(entityName: string) {
        this.entities = this.entities.filter(e => e.name !== entityName);
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
            if (intersection(requiredComponents, entity.componentTypes).length === requiredComponents.length) {
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