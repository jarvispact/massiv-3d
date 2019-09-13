/* eslint-disable prefer-destructuring, one-var, one-var-declaration-per-line */

class Mat3 {
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 1, m05 = 0, m06 = 0, m07 = 0, m08 = 1) {
        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m03 = m03;
        this.m04 = m04;
        this.m05 = m05;
        this.m06 = m06;
        this.m07 = m07;
        this.m08 = m08;
    }

    getAsArray() {
        return [
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
        ];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(mat3) {
        this.m00 = mat3[0];
        this.m01 = mat3[1];
        this.m02 = mat3[2];
        this.m03 = mat3[3];
        this.m04 = mat3[4];
        this.m05 = mat3[5];
        this.m06 = mat3[6];
        this.m07 = mat3[7];
        this.m08 = mat3[8];
        return this;
    }

    clone() {
        return new Mat3(
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
        );
    }

    multiply(mat3) {
        const a00 = this.m00, a01 = this.m01, a02 = this.m02;
        const a10 = this.m03, a11 = this.m04, a12 = this.m05;
        const a20 = this.m06, a21 = this.m07, a22 = this.m08;

        const b00 = mat3.m00, b01 = mat3.m01, b02 = mat3.m02;
        const b10 = mat3.m03, b11 = mat3.m04, b12 = mat3.m05;
        const b20 = mat3.m06, b21 = mat3.m07, b22 = mat3.m08;

        this.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        this.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        this.m02 = b00 * a02 + b01 * a12 + b02 * a22;

        this.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        this.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        this.m05 = b10 * a02 + b11 * a12 + b12 * a22;

        this.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        this.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        this.m08 = b20 * a02 + b21 * a12 + b22 * a22;

        return this;
    }
}

export default Mat3;
