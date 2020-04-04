export interface ECSEvent<Type extends string = string, Payload extends unknown = unknown> {
    type: Type;
    payload: Payload;
}

export class ECSEvent<Type extends string, Payload extends unknown> {
    type: Type;
    payload: Payload;

    constructor(type: Type, payload: Payload) {
        this.type = type;
        this.payload = payload;
    }
}