export interface Component {
    entityId: string;
    type: string;
    data: unknown;
}

export const Component = class implements Component {
    entityId = '';
    type: string;
    data: unknown;

    constructor(type: string, data: unknown) {
        this.type = type;
        this.data = data;
    }
}