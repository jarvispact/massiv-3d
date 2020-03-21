export interface Component {
    entityId: string;
    type: string;
    data: unknown;
}
export declare const Component: {
    new (type: string, data: unknown): {
        entityId: string;
        type: string;
        data: unknown;
    };
};
