export class Component<Type extends string, Data extends unknown> {
    type: Type;
    data: Data;

    constructor(type: Type, data: Data) {
        this.type = type;
        this.data = data;
    }
}