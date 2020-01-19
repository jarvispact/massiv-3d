class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.focus();
        this.keyDownMap = {};

        const keyDownHandler = (event) => { this.keyDownMap[event.key] = true; };
        const keyUpHandler = (event) => { this.keyDownMap[event.key] = false; };

        this.canvas.addEventListener('keydown', keyDownHandler);
        this.canvas.addEventListener('keyup', keyUpHandler);
    }

    isKeyDown(key) {
        return this.keyDownMap[key] || false;
    }
}

export default InputManager;
