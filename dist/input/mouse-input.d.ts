declare const BUTTON: {
    readonly PRIMARY: 0;
    readonly AUXILIARY: 1;
    readonly SECONDARY: 2;
};
declare type Buttons = typeof BUTTON;
export declare class MouseInput {
    canvas: HTMLCanvasElement;
    buttonDownMap: Record<string, boolean>;
    mouseX: number;
    mouseY: number;
    movementX: number;
    movementY: number;
    constructor(canvas: HTMLCanvasElement);
    static get BUTTON(): Buttons;
    isButtonDown(button: Buttons[keyof Buttons]): boolean;
}
export {};
