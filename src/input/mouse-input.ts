const BUTTON = {
    PRIMARY: 0,
    AUXILIARY: 1,
    SECONDARY: 2,
} as const;

export class MouseInput {
    private canvas: HTMLCanvasElement;
    private buttonDownMap: Record<string, boolean>;
    private mouseX: number;
    private mouseY: number;
    private wheelY: number;

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
        this.wheelY = 0;

        const mouseDownHandler = (event: MouseEvent) => {
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

        const mouseMoveHandler = (event: MouseEvent) => {
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
        };

        const mouseUpHandler = (event: MouseEvent) => {
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

        const wheelHandler = (event: WheelEvent) => {
            this.wheelY = event.deltaY;
        };

        this.canvas.addEventListener('mousedown', mouseDownHandler);
        this.canvas.addEventListener('mousemove', mouseMoveHandler);
        this.canvas.addEventListener('mouseup', mouseUpHandler);
        this.canvas.addEventListener('wheel', wheelHandler);
    }

    static get BUTTON() {
        return BUTTON;
    }

    isButtonDown(button: keyof typeof BUTTON) {
        return this.buttonDownMap[BUTTON[button]];
    }

    getMouseX() {
        return this.mouseX;
    }

    getMouseY() {
        return this.mouseY;
    }

    getWheelY() {
        const val = this.wheelY;
        this.wheelY = 0;
        return val;
    }
}