/* eslint-disable @typescript-eslint/no-explicit-any */

export type Nullable<T> = T | null;
export type Class<T> = { new (...args: any[]): T }
export type BufferConstructor = ArrayBuffer | SharedArrayBuffer;
