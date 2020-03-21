export declare const WorldEvent: {
    REGISTER_ENTITY: string;
    REMOVE_ENTITY: string;
};
export declare type WorldEvent = {
    type: string;
    payload: unknown;
};
export declare const createEvent: <T>(type: string, payload: T) => WorldEvent;
export declare const createRegisterEntityEvent: <T>(payload: T) => WorldEvent;
export declare const createRemoveEntityEvent: <T>(payload: T) => WorldEvent;
