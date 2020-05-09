import { ECSEvent } from '../core/event';
declare const type = "ResizeCanvasEvent";
declare type Payload = {
    width: number;
    height: number;
};
export declare class ResizeCanvasEvent extends ECSEvent<typeof type, Payload> {
    constructor(payload: Payload);
}
export {};
