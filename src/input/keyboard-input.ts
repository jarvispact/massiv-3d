const KEY = {
    A: 'a',
    B: 'b',
    C: 'c',
    D: 'd',
    E: 'e',
    F: 'f',
    G: 'g',
    H: 'h',
    I: 'i',
    J: 'j',
    K: 'k',
    L: 'l',
    M: 'm',
    N: 'n',
    O: 'o',
    P: 'p',
    Q: 'q',
    R: 'r',
    S: 's',
    T: 't',
    U: 'u',
    V: 'v',
    W: 'w',
    X: 'x',
    Y: 'y',
    Z: 'z',
    NUM_0: '0',
    NUM_1: '1',
    NUM_2: '2',
    NUM_3: '3',
    NUM_4: '4',
    NUM_5: '5',
    NUM_6: '6',
    NUM_7: '7',
    NUM_8: '8',
    NUM_9: '9',
    SPACE: ' ',
    ARROW_UP: 'ArrowUp',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_DOWN: 'ArrowDown',
} as const;

type Callback = (event: KeyboardEvent) => void;

export class KeyboardInput {
    private canvas: HTMLCanvasElement;
    private keyDownMap: Record<string, boolean>;
    private keydownCallbacks: Array<Callback> = [];
    private keyupCallbacks: Array<Callback> = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.setAttribute('tabIndex', '1');
        if (document.activeElement !== canvas) canvas.focus();

        this.keyDownMap = Object.values(KEY).reduce((accum, value) => {
            accum[value] = false;
            return accum;
        }, {} as Record<string, boolean>);

        const keyDownHandler = (event: KeyboardEvent) => {
            this.keyDownMap[event.key] = true;

            for (let i = 0; i < this.keydownCallbacks.length; i++) {
                this.keydownCallbacks[i](event);
            }
        };

        const keyUpHandler = (event: KeyboardEvent) => {
            this.keyDownMap[event.key] = false;

            for (let i = 0; i < this.keyupCallbacks.length; i++) {
                this.keyupCallbacks[i](event);
            }
        };

        this.canvas.addEventListener('keydown', keyDownHandler);
        this.canvas.addEventListener('keyup', keyUpHandler);
    }

    static get KEY() {
        return KEY;
    }

    isKeyDown(key: keyof typeof KEY) {
        return this.keyDownMap[KEY[key]];
    }

    onKeyUp(callback: Callback) {
        this.keyupCallbacks.push(callback);
        return this;
    }

    onKeyDown(callback: Callback) {
        this.keydownCallbacks.push(callback);
        return this;
    }
}