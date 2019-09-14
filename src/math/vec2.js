/* eslint-disable prefer-destructuring */

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    getAsArray() {
        return [this.x, this.y];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec2) {
        this.x = vec2[0];
        this.y = vec2[1];
        return this;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    multiply(x, y) {
        this.x *= x;
        this.y *= y;
        return this;
    }
}

export default Vec2;
