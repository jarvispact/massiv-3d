const EPSILON = 0.000001;

class Mat4 {
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 0, m05 = 1, m06 = 0, m07 = 0, m08 = 0, m09 = 0, m10 = 1, m11 = 0, m12 = 0, m13 = 0, m14 = 0, m15 = 1) {
        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m03 = m03;
        this.m04 = m04;
        this.m05 = m05;
        this.m06 = m06;
        this.m07 = m07;
        this.m08 = m08;
        this.m09 = m09;
        this.m10 = m10;
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m14 = m14;
        this.m15 = m15;
    }

    setIdentity() {
        this.m00 = 1;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = 1;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m10 = 1;
        this.m11 = 0;
        this.m12 = 0;
        this.m13 = 0;
        this.m14 = 0;
        this.m15 = 1;

        return this;
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
            this.m09,
            this.m10,
            this.m11,
            this.m12,
            this.m13,
            this.m14,
            this.m15,
        ];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(mat4) {
        this.m00 = mat4[0];
        this.m01 = mat4[1];
        this.m02 = mat4[2];
        this.m03 = mat4[3];
        this.m04 = mat4[4];
        this.m05 = mat4[5];
        this.m06 = mat4[6];
        this.m07 = mat4[7];
        this.m08 = mat4[8];
        this.m09 = mat4[9];
        this.m10 = mat4[10];
        this.m11 = mat4[11];
        this.m12 = mat4[12];
        this.m13 = mat4[13];
        this.m14 = mat4[14];
        this.m15 = mat4[15];
        return this;
    }

    clone() {
        return new Mat4(
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
            this.m09,
            this.m10,
            this.m11,
            this.m12,
            this.m13,
            this.m14,
            this.m15,
        );
    }

    multiply(mat4) {
        const a00 = this.m00, a01 = this.m01, a02 = this.m02, a03 = this.m03;
        const a10 = this.m04, a11 = this.m05, a12 = this.m06, a13 = this.m07;
        const a20 = this.m08, a21 = this.m09, a22 = this.m10, a23 = this.m11;
        const a30 = this.m12, a31 = this.m13, a32 = this.m14, a33 = this.m15;
      
        // Cache only the current line of the second matrix
        let b0  = mat4.m00, b1 = mat4.m01, b2 = mat4.m02, b3 = mat4.m03;
        this.m00 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m01 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m02 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m03 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      
        b0 = mat4.m04; b1 = mat4.m05; b2 = mat4.m06; b3 = mat4.m07;
        this.m04 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m05 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m06 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m07 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      
        b0 = mat4.m08; b1 = mat4.m09; b2 = mat4.m10; b3 = mat4.m11;
        this.m08 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m09 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m10 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m11 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      
        b0 = mat4.m12; b1 = mat4.m13; b2 = mat4.m14; b3 = mat4.m15;
        this.m12 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m13 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m14 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m15 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        return this;
    }

    setFromQuaternionTranslationScale(quat, pos, scl) {
        let x = quat.x, y = quat.y, z = quat.z, w = quat.w;
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
      
        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let sx = scl.x;
        let sy = scl.y;
        let sz = scl.z;
      
        this.m00 = (1 - (yy + zz)) * sx;
        this.m01 = (xy + wz) * sx;
        this.m02 = (xz - wy) * sx;
        this.m03 = 0;
        this.m04 = (xy - wz) * sy;
        this.m05 = (1 - (xx + zz)) * sy;
        this.m06 = (yz + wx) * sy;
        this.m07 = 0;
        this.m08 = (xz + wy) * sz;
        this.m09 = (yz - wx) * sz;
        this.m10 = (1 - (xx + yy)) * sz;
        this.m11 = 0;
        this.m12 = pos.x;
        this.m13 = pos.y;
        this.m14 = pos.z;
        this.m15 = 1;

        return this;
    }

    lookAt(position, lookAt, upVector) {
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

        const eyex = position.x;
        const eyey = position.y;
        const eyez = position.z;
        const upx = upVector.x;
        const upy = upVector.y;
        const upz = upVector.z;
        const centerx = lookAt.x;
        const centery = lookAt.y;
        const centerz = lookAt.z;
      
        if (Math.abs(eyex - centerx) < EPSILON &&
            Math.abs(eyey - centery) < EPSILON &&
            Math.abs(eyez - centerz) < EPSILON) {
            this.setIdentity();
            return this;
        }
      
        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;
      
        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
      
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
      
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
      
        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }
      
        this.m00 = x0;
        this.m01 = y0;
        this.m02 = z0;
        this.m03 = 0;
        this.m04 = x1;
        this.m05 = y1;
        this.m06 = z1;
        this.m07 = 0;
        this.m08 = x2;
        this.m09 = y2;
        this.m10 = z2;
        this.m11 = 0;
        this.m12 = -(x0 * eyex + x1 * eyey + x2 * eyez);
        this.m13 = -(y0 * eyex + y1 * eyey + y2 * eyez);
        this.m14 = -(z0 * eyex + z1 * eyey + z2 * eyez);
        this.m15 = 1;

        return this;
    }

    ortho(left, right, bottom, top, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);

        this.m00 = -2 * lr;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = -2 * bt;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m10 = 2 * nf;
        this.m11 = 0;
        this.m12 = (left + right) * lr;
        this.m13 = (top + bottom) * bt;
        this.m14 = (far + near) * nf;
        this.m15 = 1;

        return this;
    }

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        let nf;

        this.m00 = f / aspect;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = f;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m11 = -1;
        this.m12 = 0;
        this.m13 = 0;
        this.m15 = 0;

        if (far != null && far !== Infinity) {
            nf = 1 / (near - far);
            this.m10 = (far + near) * nf;
            this.m14 = (2 * far * near) * nf;
        } else {
            this.m10 = -1;
            this.m14 = -2 * near;
        }

        return this;
    }
}

export default Mat4;
