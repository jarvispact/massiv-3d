export declare type Nullable<T> = T | null;
export declare type Class<T> = {
    new (...args: any[]): T;
};
export declare type BufferConstructor = ArrayBuffer | SharedArrayBuffer;
