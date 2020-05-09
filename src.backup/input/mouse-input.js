class MouseInput {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        this.canvas.setAttribute('tabIndex', '1');
        if (document.activeElement !== canvas) canvas.focus();

        this.leftMouseButtonDown = false;
        this.middleMouseButtonDown = false;
        this.rightMouseButtonDown = false;

        this.mouseX = 0;
        this.mouseY = 0;
        this.movementX = 0;
        this.movementY = 0;

        const mouseDownHandler = (event) => {
            switch (event.button) {
            case MouseInput.BUTTONS.PRIMARY:
                this.leftMouseButtonDown = true;
                break;
            case MouseInput.BUTTONS.AUXILIARY:
                this.middleMouseButtonDown = true;
                break;
            case MouseInput.BUTTONS.SECONDARY:
                this.rightMouseButtonDown = true;
                break;
            default:
                break;
            }
        };

        const mouseMoveHandler = (event) => {
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
            this.movementX = event.movementX;
            this.movementY = event.movementY;
        };

        const mouseUpHandler = (event) => {
            switch (event.button) {
            case MouseInput.BUTTONS.PRIMARY:
                this.leftMouseButtonDown = false;
                break;
            case MouseInput.BUTTONS.AUXILIARY:
                this.middleMouseButtonDown = false;
                break;
            case MouseInput.BUTTONS.SECONDARY:
                this.rightMouseButtonDown = false;
                break;
            default:
                break;
            }
        };

        this.canvas.addEventListener('mousedown', mouseDownHandler);
        this.canvas.addEventListener('mousemove', mouseMoveHandler);
        this.canvas.addEventListener('mouseup', mouseUpHandler);
    }

    static get BUTTONS() {
        return {
            PRIMARY: 0,
            AUXILIARY: 1,
            SECONDARY: 2,
        };
    }

    isButtonDown(button) {
        switch (button) {
        case MouseInput.BUTTONS.PRIMARY:
            return this.leftMouseButtonDown;
        case MouseInput.BUTTONS.AUXILIARY:
            return this.middleMouseButtonDown;
        case MouseInput.BUTTONS.SECONDARY:
            return this.rightMouseButtonDown;
        default:
            return false;
        }
    }
}

export default MouseInput;
