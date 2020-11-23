declare const BUTTON: {
    readonly PRIMARY: 0;
    readonly AUXILIARY: 1;
    readonly SECONDARY: 2;
};
export declare class MouseInput {
    private canvas;
    private buttonDownMap;
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
    getWheelDeltaY(): number;
}
export {};
