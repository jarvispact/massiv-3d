import { Entity } from './entity';

export const WorldEvent = {
    REGISTER_ENTITY: 'RegisterEntityEvent',
    REMOVE_ENTITY: 'RemoveEntityEvent',
    SET_ACTIVE_CAMERA: 'SetActiveCamera',
};

export type WorldEvent<T = unknown> = {
    type: string;
    payload: T;
}

export const createEvent = <T>(type: string, payload: T): WorldEvent<T> => ({ type, payload });
export const createRegisterEntityEvent = (payload: Entity): WorldEvent<Entity> => ({ type: WorldEvent.REGISTER_ENTITY, payload });
export const createRemoveEntityEvent = (payload: Entity): WorldEvent<Entity> => ({ type: WorldEvent.REMOVE_ENTITY, payload });
export const createSetActiveCameraEvent = (payload: Entity): WorldEvent<Entity> => ({ type: WorldEvent.SET_ACTIVE_CAMERA, payload });