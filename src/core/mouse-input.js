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
            case MouseInput.BUTTONS.LEFT:
                this.leftMouseButtonDown = true;
                break;
            case MouseInput.BUTTONS.MIDDLE:
                this.middleMouseButtonDown = true;
                break;
            case MouseInput.BUTTONS.RIGHT:
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
            case MouseInput.BUTTONS.LEFT:
                this.leftMouseButtonDown = false;
                break;
            case MouseInput.BUTTONS.MIDDLE:
                this.middleMouseButtonDown = false;
                break;
            case MouseInput.BUTTONS.RIGHT:
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
            LEFT: 0,
            MIDDLE: 0,
            RIGHT: 0,
        };
    }

    isButtonDown(button) {
        switch (button) {
        case MouseInput.BUTTONS.LEFT:
            return this.leftMouseButtonDown;
        case MouseInput.BUTTONS.MIDDLE:
            return this.middleMouseButtonDown;
        case MouseInput.BUTTONS.RIGHT:
            return this.rightMouseButtonDown;
        default:
            return false;
        }
    }
}

export default MouseInput;
