declare const BUTTON: {
    readonly PRIMARY: 0;
    readonly AUXILIARY: 1;
    readonly SECONDARY: 2;
};
declare type Callback = (event: MouseEvent) => void;
export declare class MouseInput {
    private canvas;
    private buttonDownMap;
    private mousedownCallbacks;
    private mouseupCallbacks;
    private mouseX;
    private mouseY;
    private wheelY;
    constructor(canvas: HTMLCanvasElement);
    static get BUTTON(): {
        readonly PRIMARY: 0;
        readonly AUXILIARY: 1;
        readonly SECONDARY: 2;
    };
    isButtonDown(button: keyof typeof BUTTON): boolean;
    getMouseX(): number;
    getMouseY(): number;
    getWheelY(): number;
    onButtonDown(callback: Callback): this;
    onButtonUp(callback: Callback): this;
}
export {};
