export interface Class<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new(args?: any): T;
}

export type Nullable<T> = T | null;