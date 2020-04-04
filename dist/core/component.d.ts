export interface Component<Type extends string = string, Data extends unknown = unknown> {
    entityId: string;
    type: Type;
    data: Data;
}
export declare class Component<Type extends string, Data extends unknown> {
    entityId: string;
    type: Type;
    data: Data;
    constructor(type: Type, data: Data);
}
