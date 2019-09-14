/* eslint-disable prefer-destructuring */

class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getAsArray() {
        return [this.x, this.y, this.z];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec3) {
        this.x = vec3[0];
        this.y = vec3[1];
        this.z = vec3[2];
        return this;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    multiply(x, y, z) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }

    transformByMat4(mat4) {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        let w = mat4.m03 * x + mat4.m07 * y + mat4.m11 * z + mat4.m15;
        w = w || 1.0;

        this.x = (mat4.m00 * x + mat4.m04 * y + mat4.m08 * z + mat4.m12) / w;
        this.y = (mat4.m01 * x + mat4.m05 * y + mat4.m09 * z + mat4.m13) / w;
        this.z = (mat4.m02 * x + mat4.m06 * y + mat4.m10 * z + mat4.m14) / w;

        return this;
    }
}

export default Vec3;
