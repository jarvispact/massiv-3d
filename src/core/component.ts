export class Component<Type extends string = string, Data extends unknown = unknown> {
    entityId: string;
    type: Type;
    data: Data;

    constructor(type: Type, data: Data) {
        this.entityId = '00000000-0000-0000-0000-000000000000';
        this.type = type;
        this.data = data;
    }
}