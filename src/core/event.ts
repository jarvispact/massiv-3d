export const WorldEvent = {
    REGISTER_ENTITY: 'RegisterEntityEvent',
    REMOVE_ENTITY: 'RemoveEntityEvent',
};

export type WorldEvent = {
    type: string;
    payload: unknown;
}

export const createEvent = <T>(type: string, payload: T): WorldEvent => ({ type, payload });
export const createRegisterEntityEvent = <T>(payload: T): WorldEvent => ({ type: WorldEvent.REGISTER_ENTITY, payload });
export const createRemoveEntityEvent = <T>(payload: T): WorldEvent => ({ type: WorldEvent.REMOVE_ENTITY, payload });