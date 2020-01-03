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

    // Uniform Buffers needs mat3 as mat4
    // for whatever fucking reason
    // it took 3 days to figure this out
    getAsMat4Array() {
        return [
            this.m00,
            this.m01,
            this.m02,
            0,
            this.m03,
            this.m04,
            this.m05,
            0,
            this.m06,
            this.m07,
            this.m08,
            0,
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

    setAsNormalMatrixFromMat4(mat4) {
        const a00 = mat4.m00, a01 = mat4.m01, a02 = mat4.m02, a03 = mat4.m03;
        const a10 = mat4.m04, a11 = mat4.m05, a12 = mat4.m06, a13 = mat4.m07;
        const a20 = mat4.m08, a21 = mat4.m09, a22 = mat4.m10, a23 = mat4.m11;
        const a30 = mat4.m12, a31 = mat4.m13, a32 = mat4.m14, a33 = mat4.m15;

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;
        det = 1.0 / det;

        this.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        this.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        this.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;

        this.m03 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        this.m04 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        this.m05 = (a01 * b08 - a00 * b10 - a03 * b06) * det;

        this.m06 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        this.m07 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        this.m08 = (a30 * b04 - a31 * b02 + a33 * b00) * det;

        return this;
    }

    static normalMatrixFromMat4(mat4) {
        return new Mat3().setAsNormalMatrixFromMat4(mat4);
    }
}

export default Mat3;
