import { ECSEvent } from '../core/event';

const type = 'ResizeCanvasEvent';

type Payload = {
    width: number;
    height: number;
};

export class ResizeCanvasEvent extends ECSEvent<typeof type, Payload> {
    constructor(payload: Payload) {
        super(type, payload);
    }
}