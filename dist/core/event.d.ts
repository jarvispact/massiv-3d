export interface ECSEvent<Type extends string = string, Payload extends unknown = unknown> {
    type: Type;
    payload: Payload;
}
export declare class ECSEvent<Type extends string, Payload extends unknown> {
    type: Type;
    payload: Payload;
    constructor(type: Type, payload: Payload);
}
