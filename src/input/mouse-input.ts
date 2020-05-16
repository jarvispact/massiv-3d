const BUTTON = {
    PRIMARY: 0,
    AUXILIARY: 1,
    SECONDARY: 2,
} as const;

type Buttons = typeof BUTTON;

export class MouseInput {
    canvas: HTMLCanvasElement;
    buttonDownMap: Record<string, boolean>;
    mouseX: number;
    mouseY: number;
    movementX: number;
    movementY: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.setAttribute('tabIndex', '1');
        if (document.activeElement !== canvas) canvas.focus();

        this.buttonDownMap = Object.values(BUTTON).reduce((accum, value) => {
            accum[value] = false;
            return accum;
        }, {} as Record<string, boolean>);

        this.mouseX = 0;
        this.mouseY = 0;
        this.movementX = 0;
        this.movementY = 0;

        const mouseDownHandler = (event: MouseEvent): void => {
            switch (event.button) {
            case BUTTON.PRIMARY:
                this.buttonDownMap[BUTTON.PRIMARY] = true;
                break;
            case BUTTON.AUXILIARY:
                this.buttonDownMap[BUTTON.AUXILIARY] = true;
                break;
            case BUTTON.SECONDARY:
                this.buttonDownMap[BUTTON.SECONDARY] = true;
                break;
            default:
                break;
            }
        };

        const mouseMoveHandler = (event: MouseEvent): void => {
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
            this.movementX = event.movementX;
            this.movementY = event.movementY;
        };

        const mouseUpHandler = (event: MouseEvent): void => {
            switch (event.button) {
            case BUTTON.PRIMARY:
                this.buttonDownMap[BUTTON.PRIMARY] = false;
                break;
            case BUTTON.AUXILIARY:
                this.buttonDownMap[BUTTON.AUXILIARY] = false;
                break;
            case BUTTON.SECONDARY:
                this.buttonDownMap[BUTTON.SECONDARY] = false;
                break;
            default:
                break;
            }
        };

        this.canvas.addEventListener('mousedown', mouseDownHandler);
        this.canvas.addEventListener('mousemove', mouseMoveHandler);
        this.canvas.addEventListener('mouseup', mouseUpHandler);
    }

    static get BUTTON(): Buttons {
        return BUTTON;
    }

    isButtonDown(button: Buttons[keyof Buttons]): boolean {
        return this.buttonDownMap[button];
    }
}