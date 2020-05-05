export declare class Component<Type extends string = string, Data extends unknown = unknown> {
    entityId: string;
    type: Type;
    data: Data;
    constructor(type: Type, data: Data);
}
