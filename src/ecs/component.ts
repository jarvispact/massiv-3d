export type Component<Type extends string = string, Data extends unknown = unknown> = {
    type: Type;
    data: Data;
};