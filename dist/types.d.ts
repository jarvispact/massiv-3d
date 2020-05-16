export interface Class<T> {
    new (args?: any): T;
}
export declare type Nullable<T> = T | null;
