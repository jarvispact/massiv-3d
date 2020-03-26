import { Entity } from './entity';
export declare const WorldEvent: {
    REGISTER_ENTITY: string;
    REMOVE_ENTITY: string;
    SET_ACTIVE_CAMERA: string;
};
export declare type WorldEvent<T = unknown> = {
    type: string;
    payload: T;
};
export declare const createEvent: <T>(type: string, payload: T) => WorldEvent<T>;
export declare const createRegisterEntityEvent: (payload: Entity) => WorldEvent<Entity>;
export declare const createRemoveEntityEvent: (payload: Entity) => WorldEvent<Entity>;
export declare const createSetActiveCameraEvent: (payload: Entity) => WorldEvent<Entity>;
