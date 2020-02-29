const KeyboardInput = class {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.setAttribute('tabIndex', '1');
        if (document.activeElement !== canvas) canvas.focus();

        this.keyDownMap = Object.values(KeyboardInput.KEY).reduce((accum, value) => {
            accum[value] = false;
            return accum;
        }, {});

        this.keyPressedMap = Object.values(KeyboardInput.KEY).reduce((accum, value) => {
            accum[value] = false;
            return accum;
        }, {});

        const keyDownHandler = (event) => {
            this.keyDownMap[event.key] = true;
        };

        const keyUpHandler = (event) => {
            this.keyDownMap[event.key] = false;
            this.keyPressedMap[event.key] = true;
        };

        this.canvas.addEventListener('keydown', keyDownHandler);
        this.canvas.addEventListener('keyup', keyUpHandler);
    }

    static get KEY() {
        return {
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
        };
    }

    isKeyDown(key) {
        return this.keyDownMap[key];
    }

    keyPressed(key) {
        const val = this.keyPressedMap[key];
        this.keyPressedMap[key] = false;
        return val;
    }
};

export default KeyboardInput;
