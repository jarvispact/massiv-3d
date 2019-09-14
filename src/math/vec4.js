/* eslint-disable prefer-destructuring */

class Vec4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    getAsArray() {
        return [this.x, this.y, this.z, this.w];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec4) {
        this.x = vec4[0];
        this.y = vec4[1];
        this.z = vec4[2];
        this.w = vec4[3];
        return this;
    }

    clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }

    add(x, y, z, w) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.w += w;
        return this;
    }

    multiply(x, y, z, w) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        this.w *= w;
        return this;
    }
}

export default Vec4;
