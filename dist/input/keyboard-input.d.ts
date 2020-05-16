declare const KEY: {
    readonly NUM_0: "0";
    readonly NUM_1: "1";
    readonly NUM_2: "2";
    readonly NUM_3: "3";
    readonly NUM_4: "4";
    readonly NUM_5: "5";
    readonly NUM_6: "6";
    readonly NUM_7: "7";
    readonly NUM_8: "8";
    readonly NUM_9: "9";
    readonly SPACE: " ";
    readonly ARROW_UP: "ArrowUp";
    readonly ARROW_LEFT: "ArrowLeft";
    readonly ARROW_RIGHT: "ArrowRight";
    readonly ARROW_DOWN: "ArrowDown";
};
declare type AvailableKeys = typeof KEY;
export declare class KeyboardInput {
    canvas: HTMLCanvasElement;
    keyDownMap: Record<string, boolean>;
    keyPressedMap: Record<string, boolean>;
    constructor(canvas: HTMLCanvasElement);
    static get KEY(): AvailableKeys;
    isKeyDown(key: AvailableKeys[keyof AvailableKeys]): boolean;
    keyPressed(key: AvailableKeys[keyof AvailableKeys]): boolean;
}
export {};
