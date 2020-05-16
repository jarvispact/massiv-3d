(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.MASSIV = {}));
}(this, (function (exports) { 'use strict';

  /**
   * Common utilities
   * @module glMatrix
   */
  // Configuration Constants
  var EPSILON = 0.000001;
  var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
  /**
   * Sets the type of array used when creating new vectors and matrices
   *
   * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
   */

  function setMatrixArrayType(type) {
    ARRAY_TYPE = type;
  }
  if (!Math.hypot) Math.hypot = function () {
    var y = 0,
        i = arguments.length;

    while (i--) {
      y += arguments[i] * arguments[i];
    }

    return Math.sqrt(y);
  };

  /**
   * 3x3 Matrix
   * @module mat3
   */

  /**
   * Creates a new identity mat3
   *
   * @returns {mat3} a new 3x3 matrix
   */

  function create() {
    var out = new ARRAY_TYPE(9);

    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
    }

    out[0] = 1;
    out[4] = 1;
    out[8] = 1;
    return out;
  }
  /**
   * Create a new mat3 with the given values
   *
   * @param {Number} m00 Component in column 0, row 0 position (index 0)
   * @param {Number} m01 Component in column 0, row 1 position (index 1)
   * @param {Number} m02 Component in column 0, row 2 position (index 2)
   * @param {Number} m10 Component in column 1, row 0 position (index 3)
   * @param {Number} m11 Component in column 1, row 1 position (index 4)
   * @param {Number} m12 Component in column 1, row 2 position (index 5)
   * @param {Number} m20 Component in column 2, row 0 position (index 6)
   * @param {Number} m21 Component in column 2, row 1 position (index 7)
   * @param {Number} m22 Component in column 2, row 2 position (index 8)
   * @returns {mat3} A new mat3
   */

  function fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    var out = new ARRAY_TYPE(9);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
  }
  /**
   * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
   *
   * @param {mat3} out mat3 receiving operation result
   * @param {ReadonlyMat4} a Mat4 to derive the normal matrix from
   *
   * @returns {mat3} out
   */

  function normalFromMat4(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    return out;
  }

  /**
   * Create a new mat4 with the given values
   *
   * @param {Number} m00 Component in column 0, row 0 position (index 0)
   * @param {Number} m01 Component in column 0, row 1 position (index 1)
   * @param {Number} m02 Component in column 0, row 2 position (index 2)
   * @param {Number} m03 Component in column 0, row 3 position (index 3)
   * @param {Number} m10 Component in column 1, row 0 position (index 4)
   * @param {Number} m11 Component in column 1, row 1 position (index 5)
   * @param {Number} m12 Component in column 1, row 2 position (index 6)
   * @param {Number} m13 Component in column 1, row 3 position (index 7)
   * @param {Number} m20 Component in column 2, row 0 position (index 8)
   * @param {Number} m21 Component in column 2, row 1 position (index 9)
   * @param {Number} m22 Component in column 2, row 2 position (index 10)
   * @param {Number} m23 Component in column 2, row 3 position (index 11)
   * @param {Number} m30 Component in column 3, row 0 position (index 12)
   * @param {Number} m31 Component in column 3, row 1 position (index 13)
   * @param {Number} m32 Component in column 3, row 2 position (index 14)
   * @param {Number} m33 Component in column 3, row 3 position (index 15)
   * @returns {mat4} A new mat4
   */

  function fromValues$1(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    var out = new ARRAY_TYPE(16);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
  }
  /**
   * Set a mat4 to the identity matrix
   *
   * @param {mat4} out the receiving matrix
   * @returns {mat4} out
   */

  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Multiplies two mat4s
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the first operand
   * @param {ReadonlyMat4} b the second operand
   * @returns {mat4} out
   */

  function multiply(out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15]; // Cache only the current line of the second matrix

    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }
  /**
   * Creates a matrix from a quaternion rotation, vector translation and vector scale
   * This is equivalent to (but much faster than):
   *
   *     mat4.identity(dest);
   *     mat4.translate(dest, vec);
   *     let quatMat = mat4.create();
   *     quat4.toMat4(quat, quatMat);
   *     mat4.multiply(dest, quatMat);
   *     mat4.scale(dest, scale)
   *
   * @param {mat4} out mat4 receiving operation result
   * @param {quat4} q Rotation quaternion
   * @param {ReadonlyVec3} v Translation vector
   * @param {ReadonlyVec3} s Scaling vector
   * @returns {mat4} out
   */

  function fromRotationTranslationScale(out, q, v, s) {
    // Quaternion math
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var sx = s[0];
    var sy = s[1];
    var sz = s[2];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  /**
   * Generates a perspective projection matrix with the given bounds.
   * Passing null/undefined/no value for far will generate infinite projection matrix.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {number} fovy Vertical field of view in radians
   * @param {number} aspect Aspect ratio. typically viewport width/height
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum, can be null or Infinity
   * @returns {mat4} out
   */

  function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }
  /**
   * Generates a orthogonal projection matrix with the given bounds
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {number} left Left bound of the frustum
   * @param {number} right Right bound of the frustum
   * @param {number} bottom Bottom bound of the frustum
   * @param {number} top Top bound of the frustum
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum
   * @returns {mat4} out
   */

  function ortho(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top);
    var nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  }
  /**
   * Generates a look-at matrix with the given eye position, focal point, and up axis.
   * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {ReadonlyVec3} eye Position of the viewer
   * @param {ReadonlyVec3} center Point the viewer is looking at
   * @param {ReadonlyVec3} up vec3 pointing up
   * @returns {mat4} out
   */

  function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    var eyex = eye[0];
    var eyey = eye[1];
    var eyez = eye[2];
    var upx = up[0];
    var upy = up[1];
    var upz = up[2];
    var centerx = center[0];
    var centery = center[1];
    var centerz = center[2];

    if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
      return identity(out);
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

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  }

  /**
   * 3 Dimensional Vector
   * @module vec3
   */

  /**
   * Creates a new, empty vec3
   *
   * @returns {vec3} a new 3D vector
   */

  function create$1() {
    var out = new ARRAY_TYPE(3);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

    return out;
  }
  /**
   * Calculates the length of a vec3
   *
   * @param {ReadonlyVec3} a vector to calculate length of
   * @returns {Number} length of a
   */

  function length(a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return Math.hypot(x, y, z);
  }
  /**
   * Creates a new vec3 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @returns {vec3} a new 3D vector
   */

  function fromValues$2(x, y, z) {
    var out = new ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  /**
   * Adds two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  /**
   * Normalize a vec3
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a vector to normalize
   * @returns {vec3} out
   */

  function normalize(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var len = x * x + y * y + z * z;

    if (len > 0) {
      //TODO: evaluate use of glm_invsqrt here?
      len = 1 / Math.sqrt(len);
    }

    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
  }
  /**
   * Calculates the dot product of two vec3's
   *
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {Number} dot product of a and b
   */

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  /**
   * Computes the cross product of two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function cross(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    var bx = b[0],
        by = b[1],
        bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }
  /**
   * Alias for {@link vec3.length}
   * @function
   */

  var len = length;
  /**
   * Perform some operation over an array of vec3s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */

  var forEach = function () {
    var vec = create$1();
    return function (a, stride, offset, count, fn, arg) {
      var i, l;

      if (!stride) {
        stride = 3;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }

      return a;
    };
  }();

  /**
   * 4 Dimensional Vector
   * @module vec4
   */

  /**
   * Creates a new, empty vec4
   *
   * @returns {vec4} a new 4D vector
   */

  function create$2() {
    var out = new ARRAY_TYPE(4);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
    }

    return out;
  }
  /**
   * Creates a new vec4 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @param {Number} w W component
   * @returns {vec4} a new 4D vector
   */

  function fromValues$3(x, y, z, w) {
    var out = new ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }
  /**
   * Normalize a vec4
   *
   * @param {vec4} out the receiving vector
   * @param {ReadonlyVec4} a vector to normalize
   * @returns {vec4} out
   */

  function normalize$1(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var w = a[3];
    var len = x * x + y * y + z * z + w * w;

    if (len > 0) {
      len = 1 / Math.sqrt(len);
    }

    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
    return out;
  }
  /**
   * Perform some operation over an array of vec4s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */

  var forEach$1 = function () {
    var vec = create$2();
    return function (a, stride, offset, count, fn, arg) {
      var i, l;

      if (!stride) {
        stride = 4;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        vec[3] = a[i + 3];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
        a[i + 3] = vec[3];
      }

      return a;
    };
  }();

  /**
   * Quaternion
   * @module quat
   */

  /**
   * Creates a new identity quat
   *
   * @returns {quat} a new quaternion
   */

  function create$3() {
    var out = new ARRAY_TYPE(4);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

    out[3] = 1;
    return out;
  }
  /**
   * Sets a quat from the given angle and rotation axis,
   * then returns it.
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyVec3} axis the axis around which to rotate
   * @param {Number} rad the angle in radians
   * @returns {quat} out
   **/

  function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  }
  /**
   * Multiplies two quat's
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a the first operand
   * @param {ReadonlyQuat} b the second operand
   * @returns {quat} out
   */

  function multiply$1(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  }
  /**
   * Performs a spherical linear interpolation between two quat
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a the first operand
   * @param {ReadonlyQuat} b the second operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {quat} out
   */

  function slerp(out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];
    var omega, cosom, sinom, scale0, scale1; // calc cosine

    cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    } // calculate coefficients


    if (1.0 - cosom > EPSILON) {
      // standard case (slerp)
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    } // calculate final values


    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    return out;
  }
  /**
   * Creates a quaternion from the given 3x3 rotation matrix.
   *
   * NOTE: The resultant quaternion is not normalized, so you should be sure
   * to renormalize the quaternion yourself where necessary.
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyMat3} m rotation matrix
   * @returns {quat} out
   * @function
   */

  function fromMat3(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w

      out[3] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)

      out[0] = (m[5] - m[7]) * fRoot;
      out[1] = (m[6] - m[2]) * fRoot;
      out[2] = (m[1] - m[3]) * fRoot;
    } else {
      // |w| <= 1/2
      var i = 0;
      if (m[4] > m[0]) i = 1;
      if (m[8] > m[i * 3 + i]) i = 2;
      var j = (i + 1) % 3;
      var k = (i + 2) % 3;
      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
      out[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
      out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
      out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
  }
  /**
   * Creates a quaternion from the given euler angle x, y, z.
   *
   * @param {quat} out the receiving quaternion
   * @param {x} Angle to rotate around X axis in degrees.
   * @param {y} Angle to rotate around Y axis in degrees.
   * @param {z} Angle to rotate around Z axis in degrees.
   * @returns {quat} out
   * @function
   */

  function fromEuler(out, x, y, z) {
    var halfToRad = 0.5 * Math.PI / 180.0;
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;
    var sx = Math.sin(x);
    var cx = Math.cos(x);
    var sy = Math.sin(y);
    var cy = Math.cos(y);
    var sz = Math.sin(z);
    var cz = Math.cos(z);
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
    return out;
  }
  /**
   * Creates a new quat initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @param {Number} w W component
   * @returns {quat} a new quaternion
   * @function
   */

  var fromValues$4 = fromValues$3;
  /**
   * Normalize a quat
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a quaternion to normalize
   * @returns {quat} out
   * @function
   */

  var normalize$2 = normalize$1;
  /**
   * Sets a quaternion to represent the shortest rotation from one
   * vector to another.
   *
   * Both vectors are assumed to be unit length.
   *
   * @param {quat} out the receiving quaternion.
   * @param {ReadonlyVec3} a the initial vector
   * @param {ReadonlyVec3} b the destination vector
   * @returns {quat} out
   */

  var rotationTo = function () {
    var tmpvec3 = create$1();
    var xUnitVec3 = fromValues$2(1, 0, 0);
    var yUnitVec3 = fromValues$2(0, 1, 0);
    return function (out, a, b) {
      var dot$1 = dot(a, b);

      if (dot$1 < -0.999999) {
        cross(tmpvec3, xUnitVec3, a);
        if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
        normalize(tmpvec3, tmpvec3);
        setAxisAngle(out, tmpvec3, Math.PI);
        return out;
      } else if (dot$1 > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
      } else {
        cross(tmpvec3, a, b);
        out[0] = tmpvec3[0];
        out[1] = tmpvec3[1];
        out[2] = tmpvec3[2];
        out[3] = 1 + dot$1;
        return normalize$2(out, out);
      }
    };
  }();
  /**
   * Performs a spherical linear interpolation with two control points
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a the first operand
   * @param {ReadonlyQuat} b the second operand
   * @param {ReadonlyQuat} c the third operand
   * @param {ReadonlyQuat} d the fourth operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {quat} out
   */

  var sqlerp = function () {
    var temp1 = create$3();
    var temp2 = create$3();
    return function (out, a, b, c, d, t) {
      slerp(temp1, a, d, t);
      slerp(temp2, b, c, t);
      slerp(out, temp1, temp2, 2 * t * (1 - t));
      return out;
    };
  }();
  /**
   * Sets the specified quaternion with values corresponding to the given
   * axes. Each axis is a vec3 and is expected to be unit length and
   * perpendicular to all other specified axes.
   *
   * @param {ReadonlyVec3} view  the vector representing the viewing direction
   * @param {ReadonlyVec3} right the vector representing the local "right" direction
   * @param {ReadonlyVec3} up    the vector representing the local "up" direction
   * @returns {quat} out
   */

  var setAxes = function () {
    var matr = create();
    return function (out, view, right, up) {
      matr[0] = right[0];
      matr[3] = right[1];
      matr[6] = right[2];
      matr[1] = up[0];
      matr[4] = up[1];
      matr[7] = up[2];
      matr[2] = -view[0];
      matr[5] = -view[1];
      matr[8] = -view[2];
      return normalize$2(out, fromMat3(out, matr));
    };
  }();

  class Component {
      constructor(type, data) {
          this.entityId = '00000000-0000-0000-0000-000000000000';
          this.type = type;
          this.data = data;
      }
  }

  const type = 'DirectionalLight';
  class DirectionalLight extends Component {
      constructor(args) {
          super(type, {
              direction: args.direction,
              color: args.color || fromValues$2(1, 1, 1),
              intensity: args.intensity || 1,
              webglDirty: {
                  direction: true,
                  color: true,
                  intensity: true,
              },
          });
      }
      setDirection(x, y, z) {
          this.data.direction[0] = x;
          this.data.direction[1] = y;
          this.data.direction[2] = z;
          this.data.webglDirty.direction = true;
      }
      setColor(r, g, b) {
          this.data.direction[0] = r;
          this.data.direction[1] = g;
          this.data.direction[2] = b;
          this.data.webglDirty.color = true;
      }
      setIntensity(intensity) {
          this.data.intensity = intensity;
          this.data.webglDirty.intensity = true;
      }
      resetWebglDirtyFlags() {
          this.data.webglDirty.direction = false;
          this.data.webglDirty.color = false;
          this.data.webglDirty.intensity = false;
      }
  }

  const type$1 = 'OrthographicCamera';
  class OrthographicCamera extends Component {
      constructor(args) {
          super(type$1, {
              translation: args.translation,
              lookAt: args.lookAt ? args.lookAt : fromValues$2(0, 0, 0),
              upVector: args.upVector ? args.upVector : fromValues$2(0, 1, 0),
              viewMatrix: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              projectionMatrix: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              cache: {
                  translation: create$1(),
              },
              dirty: {
                  viewMatrix: true,
                  projectionMatrix: true,
              },
              webglDirty: {
                  translation: true,
                  viewMatrix: true,
                  projectionMatrix: true,
              },
              left: args.left,
              right: args.right,
              bottom: args.bottom,
              top: args.top,
              near: args.near,
              far: args.far,
          });
      }
      translate(x, y, z) {
          const t = this.data.cache.translation;
          t[0] = x;
          t[1] = y;
          t[2] = z;
          add(this.data.translation, this.data.translation, t);
          this.data.dirty.viewMatrix = true;
          this.data.webglDirty.translation = true;
          this.data.webglDirty.viewMatrix = true;
      }
      resetWebglDirtyFlags() {
          this.data.webglDirty.translation = false;
          this.data.webglDirty.viewMatrix = false;
          this.data.webglDirty.projectionMatrix = false;
      }
  }

  const type$2 = 'PerspectiveCamera';
  class PerspectiveCamera extends Component {
      constructor(args) {
          super(type$2, {
              translation: args.translation,
              lookAt: args.lookAt ? args.lookAt : fromValues$2(0, 0, 0),
              upVector: args.upVector ? args.upVector : fromValues$2(0, 1, 0),
              viewMatrix: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              projectionMatrix: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              cache: {
                  translation: create$1(),
              },
              dirty: {
                  viewMatrix: true,
                  projectionMatrix: true,
              },
              webglDirty: {
                  translation: true,
                  viewMatrix: true,
                  projectionMatrix: true,
              },
              fov: args.fov || 45,
              aspect: args.aspect,
              near: args.near || 0.1,
              far: args.far || 1000,
          });
      }
      translate(x, y, z) {
          const t = this.data.cache.translation;
          t[0] = x;
          t[1] = y;
          t[2] = z;
          add(this.data.translation, this.data.translation, t);
          this.data.dirty.viewMatrix = true;
          this.data.webglDirty.translation = true;
          this.data.webglDirty.viewMatrix = true;
      }
      setAspect(aspect) {
          this.data.aspect = aspect;
          this.data.dirty.projectionMatrix = true;
          this.data.webglDirty.projectionMatrix = true;
      }
      resetWebglDirtyFlags() {
          this.data.webglDirty.translation = false;
          this.data.webglDirty.viewMatrix = false;
          this.data.webglDirty.projectionMatrix = false;
      }
  }

  const type$3 = 'Renderable';
  class Renderable extends Component {
      constructor(args) {
          super(type$3, args);
      }
  }

  const type$4 = 'Transform';
  class Transform extends Component {
      constructor(args = {}) {
          super(type$4, {
              translation: args.translation || fromValues$2(0, 0, 0),
              scaling: args.scaling || fromValues$2(1, 1, 1),
              quaternion: args.quaternion || fromValues$4(0, 0, 0, 1),
              modelMatrix: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              cache: {
                  translation: create$1(),
                  scaling: create$1(),
                  quaternion: create$3(),
              },
              dirty: {
                  modelMatrix: true,
              },
              webglDirty: {
                  modelMatrix: true,
              },
          });
      }
      translate(x, y, z) {
          const t = this.data.cache.translation;
          t[0] = x;
          t[1] = y;
          t[2] = z;
          add(this.data.translation, this.data.translation, t);
          this.data.dirty.modelMatrix = true;
          this.data.webglDirty.modelMatrix = true;
      }
      scale(x, y, z) {
          const s = this.data.cache.scaling;
          s[0] = x;
          s[1] = y;
          s[2] = z;
          add(this.data.scaling, this.data.scaling, s);
          this.data.dirty.modelMatrix = true;
          this.data.webglDirty.modelMatrix = true;
      }
      rotate(x, y, z) {
          const q = this.data.cache.quaternion;
          fromEuler(q, x, y, z);
          multiply$1(this.data.quaternion, this.data.quaternion, q);
          this.data.dirty.modelMatrix = true;
          this.data.webglDirty.modelMatrix = true;
      }
      resetWebglDirtyFlags() {
          this.data.webglDirty.modelMatrix = false;
      }
  }

  // https://gist.github.com/jcxplorer/823878
  var uuid = () => {
      let uuid = '';
      let i = 0;
      for (i; i < 32; i++) {
          const random = Math.random() * 16 | 0;
          if (i === 8 || i === 12 || i === 16 || i === 20)
              uuid += '-';
          uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }
      return uuid;
  };

  class Entity {
      constructor(world) {
          this.id = uuid();
          this.world = world;
      }
      getComponents() {
          return this.world.componentsByEntityId[this.id];
      }
      getComponent(klass) {
          return this.world.componentsByEntityId[this.id].find(c => c.type === klass.name);
      }
  }

  class ECSEvent {
      constructor(type, payload) {
          this.type = type;
          this.payload = payload;
      }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable @typescript-eslint/no-empty-function */
  class System {
      update(delta, time) { }
  }
  class RenderSystem {
      render(delta, time) { }
  }

  const type$5 = 'ResizeCanvasEvent';
  class ResizeCanvasEvent extends ECSEvent {
      constructor(payload) {
          super(type$5, payload);
      }
  }

  class UpdateCameraSystem extends System {
      init() {
          this.world.subscribe(this, [ResizeCanvasEvent]);
      }
      on(event) {
          const perspectiveCameras = this.world.getComponentsByType(PerspectiveCamera);
          for (let i = 0; i < perspectiveCameras.length; i++) {
              const c = perspectiveCameras[i];
              c.setAspect(event.payload.width / event.payload.height);
          }
          this.update();
      }
      update() {
          const perspectiveCameras = this.world.getComponentsByType(PerspectiveCamera);
          const orthographicCameras = this.world.getComponentsByType(OrthographicCamera);
          for (let i = 0; i < perspectiveCameras.length; i++) {
              const c = perspectiveCameras[i];
              if (c.data.dirty.viewMatrix) {
                  lookAt(c.data.viewMatrix, c.data.translation, c.data.lookAt, c.data.upVector);
                  c.data.dirty.viewMatrix = false;
              }
              if (c.data.dirty.projectionMatrix) {
                  perspective(c.data.projectionMatrix, c.data.fov, c.data.aspect, c.data.near, c.data.far);
                  c.data.dirty.projectionMatrix = false;
              }
          }
          for (let i = 0; i < orthographicCameras.length; i++) {
              const c = orthographicCameras[i];
              if (c.data.dirty.viewMatrix) {
                  lookAt(c.data.viewMatrix, c.data.translation, c.data.lookAt, c.data.upVector);
                  c.data.dirty.viewMatrix = false;
              }
              if (c.data.dirty.projectionMatrix) {
                  ortho(c.data.projectionMatrix, c.data.left, c.data.right, c.data.bottom, c.data.top, c.data.near, c.data.far);
                  c.data.dirty.projectionMatrix = false;
              }
          }
      }
  }

  class UpdateTransformSystem extends System {
      update() {
          const transforms = this.world.getComponentsByType(Transform);
          for (let i = 0; i < transforms.length; i++) {
              const t = transforms[i];
              if (t.data.dirty.modelMatrix) {
                  fromRotationTranslationScale(t.data.modelMatrix, t.data.quaternion, t.data.translation, t.data.scaling);
                  t.data.dirty.modelMatrix = false;
              }
          }
      }
  }

  const cleanupAndFilterSystem = (systemToRemove) => (system) => {
      if (system === systemToRemove && system.cleanup) {
          system.cleanup();
          return false;
      }
      return true;
  };
  const createGetDelta = (then = 0) => (now) => {
      now *= 0.001;
      const delta = now - then;
      then = now;
      return delta;
  };
  const defaultOptions = {
      transformAutoUpdate: true,
      cameraAutoUpdate: true,
  };
  class World {
      constructor(options) {
          this.getDelta = createGetDelta();
          this.options = options ? Object.assign(Object.assign({}, defaultOptions), options) : defaultOptions;
          this.componentsByType = {};
          this.componentsByEntityId = {};
          this.subscriptions = {};
          this.systems = [];
          this.renderSystems = [];
          if (this.options.cameraAutoUpdate)
              this.registerSystem(new UpdateCameraSystem());
          if (this.options.transformAutoUpdate)
              this.registerSystem(new UpdateTransformSystem());
      }
      publish(event) {
          if (!this.subscriptions[event.type])
              return;
          this.subscriptions[event.type].forEach((system) => system.on && system.on(event));
      }
      subscribe(system, events) {
          events.forEach((event) => {
              if (!this.subscriptions[event.name])
                  this.subscriptions[event.name] = [];
              this.subscriptions[event.name].push(system);
          });
      }
      getComponentsByType(klass) {
          if (!this.componentsByType[klass.name])
              return [];
          return this.componentsByType[klass.name];
      }
      getComponentsByEntityId(entityId) {
          return this.componentsByEntityId[entityId] || [];
      }
      getComponentByEntityIdAndType(entityId, klass) {
          return this.getComponentsByEntityId(entityId).find(c => c.type === klass.name);
      }
      registerEntity(components) {
          const entity = new Entity(this);
          if (!this.componentsByEntityId[entity.id])
              this.componentsByEntityId[entity.id] = [];
          components.forEach((component) => {
              component.entityId = entity.id;
              if (!this.componentsByType[component.type])
                  this.componentsByType[component.type] = [];
              this.componentsByType[component.type].push(component);
              this.componentsByEntityId[entity.id].push(component);
          });
          return entity;
      }
      removeEntity(entity) {
          this.componentsByEntityId[entity.id] = [];
          Object.keys(this.componentsByType).forEach((type) => {
              this.componentsByType[type] = this.componentsByType[type].filter(c => c.entityId !== entity.id);
          });
          return this;
      }
      registerSystem(system) {
          system.world = this;
          if (system.init)
              system.init();
          this.systems.push(system);
          return this;
      }
      removeSystem(system) {
          this.systems = this.systems.filter(cleanupAndFilterSystem(system));
          return this;
      }
      registerRenderSystem(renderSystem) {
          renderSystem.world = this;
          if (renderSystem.init)
              renderSystem.init();
          this.renderSystems.push(renderSystem);
          return this;
      }
      removeRenderSystem(system) {
          this.renderSystems = this.renderSystems.filter(cleanupAndFilterSystem(system));
          return this;
      }
      update(time) {
          const delta = this.getDelta(time);
          for (let i = 0; i < this.systems.length; i++)
              this.systems[i].update(delta, time);
      }
      render(time) {
          const delta = this.getDelta(time);
          for (let i = 0; i < this.renderSystems.length; i++)
              this.renderSystems[i].render(delta, time);
      }
  }

  const type$6 = 'RegisterEntityEvent';
  class RegisterEntityEvent extends ECSEvent {
      constructor(entity) {
          super(type$6, entity);
      }
  }

  const type$7 = 'RemoveEntityEvent';
  class RemoveEntityEvent extends ECSEvent {
      constructor(entity) {
          super(type$7, entity);
      }
  }

  class QuadGeometry {
      getData() {
          return {
              positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
              indices: [0, 1, 2, 0, 2, 3],
              normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
              uvs: [0, 0, 1, 0, 1, 1, 0, 1],
              colors: null,
          };
      }
  }

  class RawGeometry {
      constructor(args = {}) {
          this.positions = args.positions || null;
          this.uvs = args.uvs || null;
          this.normals = args.normals || null;
          this.indices = args.indices || null;
          this.colors = args.colors || null;
      }
      getData() {
          return {
              positions: this.positions,
              uvs: this.uvs,
              normals: this.normals,
              indices: this.indices,
              colors: this.colors,
          };
      }
  }

  const KEY = {
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
  class KeyboardInput {
      constructor(canvas) {
          this.canvas = canvas;
          this.canvas.setAttribute('tabIndex', '1');
          if (document.activeElement !== canvas)
              canvas.focus();
          this.keyDownMap = Object.values(KEY).reduce((accum, value) => {
              accum[value] = false;
              return accum;
          }, {});
          this.keyPressedMap = Object.values(KEY).reduce((accum, value) => {
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
          return KEY;
      }
      isKeyDown(key) {
          return this.keyDownMap[key];
      }
      keyPressed(key) {
          const val = this.keyPressedMap[key];
          this.keyPressedMap[key] = false;
          return val;
      }
  }

  const BUTTON = {
      PRIMARY: 0,
      AUXILIARY: 1,
      SECONDARY: 2,
  };
  class MouseInput {
      constructor(canvas) {
          this.canvas = canvas;
          this.canvas.setAttribute('tabIndex', '1');
          if (document.activeElement !== canvas)
              canvas.focus();
          this.buttonDownMap = Object.values(BUTTON).reduce((accum, value) => {
              accum[value] = false;
              return accum;
          }, {});
          this.mouseX = 0;
          this.mouseY = 0;
          this.movementX = 0;
          this.movementY = 0;
          const mouseDownHandler = (event) => {
              switch (event.button) {
                  case BUTTON.PRIMARY:
                      this.buttonDownMap[BUTTON.PRIMARY] = true;
                      break;
                  case BUTTON.AUXILIARY:
                      this.buttonDownMap[BUTTON.AUXILIARY] = true;
                      break;
                  case BUTTON.SECONDARY:
                      this.buttonDownMap[BUTTON.SECONDARY] = true;
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
                  case BUTTON.PRIMARY:
                      this.buttonDownMap[BUTTON.PRIMARY] = false;
                      break;
                  case BUTTON.AUXILIARY:
                      this.buttonDownMap[BUTTON.AUXILIARY] = false;
                      break;
                  case BUTTON.SECONDARY:
                      this.buttonDownMap[BUTTON.SECONDARY] = false;
                      break;
              }
          };
          this.canvas.addEventListener('mousedown', mouseDownHandler);
          this.canvas.addEventListener('mousemove', mouseMoveHandler);
          this.canvas.addEventListener('mouseup', mouseUpHandler);
      }
      static get BUTTON() {
          return BUTTON;
      }
      isButtonDown(button) {
          return this.buttonDownMap[button];
      }
  }

  const FileLoader = {
      load: async (objFilePath) => fetch(objFilePath).then(response => response.text()),
  };

  const ImageLoader = {
      load: async (imageSrcUrl) => new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`error loading image from url: "${imageSrcUrl}"`));
          img.src = imageSrcUrl;
      }),
  };

  /* eslint-disable max-len */
  const objectRegex = /^o\s(.*)$/;
  const vertexPositionRegex = /^v\s(\S+)\s(\S+)\s(\S+)$/;
  const vertexUvRegex = /^vt\s(\S+)\s(\S+)$/;
  const vertexNormalRegex = /^vn\s(\S+)\s(\S+)\s(\S+)$/;
  const triangleFaceRegex = /^f\s(\S+)\s(\S+)\s(\S+)$/;
  const quadFaceRegex = /^f\s(\S+)\s(\S+)\s(\S+)\s(\S+)$/;
  const vnuRegex = /^(\d{1,})\/(\d{1,})\/(\d{1,})$/;
  const vnRegex = /^(\d{1,})\/\/(\d{1,})$/;
  const toFloat = (val) => Number.parseFloat(val);
  const toInt = (val) => Number.parseInt(val, 10);
  const correctIndex = (idx) => idx - 1;
  const parseObjFile = (fileContent) => {
      const objDataLines = fileContent.trim().split('\n');
      const allPositions = [];
      const allUvs = [];
      const allNormals = [];
      const objects = [];
      let indexCounter = 0;
      for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
          const line = objDataLines[lineIndex].trim();
          const objectMatch = line.match(objectRegex);
          if (objectMatch) {
              const [, name] = objectMatch;
              objects.push({ name, positions: [], uvs: [], normals: [], indices: [] });
              indexCounter = 0;
          }
          const vertexPositionMatch = line.match(vertexPositionRegex);
          if (vertexPositionMatch) {
              const [, x, y, z] = vertexPositionMatch;
              allPositions.push([toFloat(x), toFloat(y), toFloat(z)]);
          }
          const vertexUvMatch = line.match(vertexUvRegex);
          if (vertexUvMatch) {
              const [, x, y] = vertexUvMatch;
              allUvs.push([toFloat(x), toFloat(y)]);
          }
          const vertexNormalMatch = line.match(vertexNormalRegex);
          if (vertexNormalMatch) {
              const [, x, y, z] = vertexNormalMatch;
              allNormals.push([toFloat(x), toFloat(y), toFloat(z)]);
          }
          const triangleFaceMatch = line.match(triangleFaceRegex);
          if (triangleFaceMatch) {
              const currentObject = objects[objects.length - 1];
              const [, firstVertex, secondVertex, thirdVertex] = triangleFaceMatch;
              // VERTEX/UV/NORMAL
              const firstVertexVnuMatch = firstVertex.match(vnuRegex);
              const secondVertexVnuMatch = secondVertex.match(vnuRegex);
              const thirdVertexVnuMatch = thirdVertex.match(vnuRegex);
              if (firstVertexVnuMatch && secondVertexVnuMatch && thirdVertexVnuMatch) {
                  const [, firstPositionIndex, firstUvIndex, firstNormalIndex] = firstVertexVnuMatch;
                  const [, secondPositionIndex, secondUvIndex, secondNormalIndex] = secondVertexVnuMatch;
                  const [, thirdPositionIndex, thirdUvIndex, thirdNormalIndex] = thirdVertexVnuMatch;
                  const positions = [
                      ...allPositions[correctIndex(toInt(firstPositionIndex))],
                      ...allPositions[correctIndex(toInt(secondPositionIndex))],
                      ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                  ];
                  const uvs = [
                      ...allUvs[correctIndex(toInt(firstUvIndex))],
                      ...allUvs[correctIndex(toInt(secondUvIndex))],
                      ...allUvs[correctIndex(toInt(thirdUvIndex))],
                  ];
                  const normals = [
                      ...allNormals[correctIndex(toInt(firstNormalIndex))],
                      ...allNormals[correctIndex(toInt(secondNormalIndex))],
                      ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                  ];
                  currentObject.positions.push(...positions);
                  currentObject.uvs.push(...uvs);
                  currentObject.normals.push(...normals);
                  currentObject.indices.push(indexCounter, indexCounter + 1, indexCounter + 2);
                  indexCounter += 3;
              }
              // VERTEX//NORMAL
              const firstVertexVnMatch = firstVertex.match(vnRegex);
              const secondVertexVnMatch = secondVertex.match(vnRegex);
              const thirdVertexVnMatch = thirdVertex.match(vnRegex);
              if (firstVertexVnMatch && secondVertexVnMatch && thirdVertexVnMatch) {
                  const [, firstPositionIndex, firstNormalIndex] = firstVertexVnMatch;
                  const [, secondPositionIndex, secondNormalIndex] = secondVertexVnMatch;
                  const [, thirdPositionIndex, thirdNormalIndex] = thirdVertexVnMatch;
                  const positions = [
                      ...allPositions[correctIndex(toInt(firstPositionIndex))],
                      ...allPositions[correctIndex(toInt(secondPositionIndex))],
                      ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                  ];
                  const normals = [
                      ...allNormals[correctIndex(toInt(firstNormalIndex))],
                      ...allNormals[correctIndex(toInt(secondNormalIndex))],
                      ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                  ];
                  currentObject.positions.push(...positions);
                  currentObject.normals.push(...normals);
                  currentObject.indices.push(indexCounter, indexCounter + 1, indexCounter + 2);
                  indexCounter += 3;
              }
          }
          // 0, 1, 2, 0, 2, 3
          const quadFaceMatch = line.match(quadFaceRegex);
          if (quadFaceMatch) {
              const currentObject = objects[objects.length - 1];
              const [, firstVertex, secondVertex, thirdVertex, fourthVertex] = quadFaceMatch;
              // VERTEX/UV/NORMAL
              const firstVertexVnuMatch = firstVertex.match(vnuRegex);
              const secondVertexVnuMatch = secondVertex.match(vnuRegex);
              const thirdVertexVnuMatch = thirdVertex.match(vnuRegex);
              const fourthVertexVnuMatch = fourthVertex.match(vnuRegex);
              if (firstVertexVnuMatch && secondVertexVnuMatch && thirdVertexVnuMatch && fourthVertexVnuMatch) {
                  const [, firstPositionIndex, firstUvIndex, firstNormalIndex] = firstVertexVnuMatch;
                  const [, secondPositionIndex, secondUvIndex, secondNormalIndex] = secondVertexVnuMatch;
                  const [, thirdPositionIndex, thirdUvIndex, thirdNormalIndex] = thirdVertexVnuMatch;
                  const [, fourthPositionIndex, fourthUvIndex, fourthNormalIndex] = fourthVertexVnuMatch;
                  const positions = [
                      ...allPositions[correctIndex(toInt(firstPositionIndex))],
                      ...allPositions[correctIndex(toInt(secondPositionIndex))],
                      ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                      ...allPositions[correctIndex(toInt(firstPositionIndex))],
                      ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                      ...allPositions[correctIndex(toInt(fourthPositionIndex))],
                  ];
                  const uvs = [
                      ...allUvs[correctIndex(toInt(firstUvIndex))],
                      ...allUvs[correctIndex(toInt(secondUvIndex))],
                      ...allUvs[correctIndex(toInt(thirdUvIndex))],
                      ...allUvs[correctIndex(toInt(firstUvIndex))],
                      ...allUvs[correctIndex(toInt(thirdUvIndex))],
                      ...allUvs[correctIndex(toInt(fourthUvIndex))],
                  ];
                  const normals = [
                      ...allNormals[correctIndex(toInt(firstNormalIndex))],
                      ...allNormals[correctIndex(toInt(secondNormalIndex))],
                      ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                      ...allNormals[correctIndex(toInt(firstNormalIndex))],
                      ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                      ...allNormals[correctIndex(toInt(fourthNormalIndex))],
                  ];
                  currentObject.positions.push(...positions);
                  currentObject.uvs.push(...uvs);
                  currentObject.normals.push(...normals);
                  currentObject.indices.push(indexCounter, indexCounter + 1, indexCounter + 2, indexCounter + 3, indexCounter + 4, indexCounter + 5);
                  indexCounter += 6;
              }
              // VERTEX//NORMAL
              const firstVertexVnMatch = firstVertex.match(vnRegex);
              const secondVertexVnMatch = secondVertex.match(vnRegex);
              const thirdVertexVnMatch = thirdVertex.match(vnRegex);
              const fourthVertexVnMatch = fourthVertex.match(vnRegex);
              if (firstVertexVnMatch && secondVertexVnMatch && thirdVertexVnMatch && fourthVertexVnMatch) {
                  const [, firstPositionIndex, firstNormalIndex] = firstVertexVnMatch;
                  const [, secondPositionIndex, secondNormalIndex] = secondVertexVnMatch;
                  const [, thirdPositionIndex, thirdNormalIndex] = thirdVertexVnMatch;
                  const [, fourthPositionIndex, fourthNormalIndex] = fourthVertexVnMatch;
                  const positions = [
                      ...allPositions[correctIndex(toInt(firstPositionIndex))],
                      ...allPositions[correctIndex(toInt(secondPositionIndex))],
                      ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                      ...allPositions[correctIndex(toInt(firstPositionIndex))],
                      ...allPositions[correctIndex(toInt(thirdPositionIndex))],
                      ...allPositions[correctIndex(toInt(fourthPositionIndex))],
                  ];
                  const normals = [
                      ...allNormals[correctIndex(toInt(firstNormalIndex))],
                      ...allNormals[correctIndex(toInt(secondNormalIndex))],
                      ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                      ...allNormals[correctIndex(toInt(firstNormalIndex))],
                      ...allNormals[correctIndex(toInt(thirdNormalIndex))],
                      ...allNormals[correctIndex(toInt(fourthNormalIndex))],
                  ];
                  currentObject.positions.push(...positions);
                  currentObject.normals.push(...normals);
                  currentObject.indices.push(indexCounter, indexCounter + 1, indexCounter + 2, indexCounter + 3, indexCounter + 4, indexCounter + 5);
                  indexCounter += 6;
              }
          }
      }
      return { objects };
  };

  const defaultContextAttributeOptions = {
      premultipliedAlpha: false,
      alpha: false,
      powerPreference: 'high-performance',
      antialias: true,
      desynchronized: true,
  };
  const getDefaultWebGL2Options = (gl) => ({
      depthFunc: gl.LEQUAL,
      blendEquation: gl.FUNC_ADD,
      blendFuncSFactor: gl.SRC_ALPHA,
      blendFuncDFactor: gl.ONE_MINUS_SRC_ALPHA,
      cullFace: gl.BACK,
      depthTestEnabled: true,
      blendEnabled: false,
      cullFaceEnabled: false,
  });
  const getWebGL2Context = (canvas, contextAttributeOptions, getWebGL2Options) => {
      const gl = canvas.getContext('webgl2', Object.assign(Object.assign({}, defaultContextAttributeOptions), contextAttributeOptions || {}));
      if (!gl)
          throw new Error('cannot get webgl2 context');
      const options = Object.assign(Object.assign({}, getDefaultWebGL2Options(gl)), getWebGL2Options ? getWebGL2Options(gl) : {});
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.colorMask(true, true, true, false);
      gl.depthFunc(options.depthFunc);
      gl.blendEquation(options.blendEquation);
      gl.blendFunc(options.blendFuncSFactor, options.blendFuncDFactor);
      gl.cullFace(options.cullFace);
      if (options.depthTestEnabled) {
          gl.enable(gl.DEPTH_TEST);
      }
      else {
          gl.disable(gl.DEPTH_TEST);
      }
      if (options.blendEnabled) {
          gl.enable(gl.BLEND);
      }
      else {
          gl.disable(gl.BLEND);
      }
      if (options.cullFaceEnabled) {
          gl.enable(gl.CULL_FACE);
      }
      else {
          gl.disable(gl.CULL_FACE);
      }
      return gl;
  };
  // export const glsl = (sourceCode: TemplateStringsArray, ...interpolations: unknown[]) => {
  //     console.log({ sourceCode, interpolations });
  //     return sourceCode;
  // };
  const createShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      if (!shader)
          throw new Error('could not create shader');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!success) {
          console.error(gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          throw new Error('could not create shader');
      }
      return shader;
  };
  const createProgram = (gl, vertexShader, fragmentShader) => {
      const program = gl.createProgram();
      if (!program)
          throw new Error('could not create program');
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!success) {
          console.error(gl.getProgramInfoLog(program));
          gl.deleteProgram(program);
          throw new Error('could not create program');
      }
      return program;
  };
  const createArrayBuffer = (gl, data, location, bufferSize) => {
      const buffer = gl.createBuffer();
      if (!buffer)
          throw new Error('could not create array buffer');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, bufferSize, gl.FLOAT, false, 0, 0);
      return buffer;
  };
  const createElementArrayBuffer = (gl, indices) => {
      const buffer = gl.createBuffer();
      if (!buffer)
          throw new Error('could not create element array buffer');
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      return buffer;
  };
  const createVertexArray = (gl) => {
      const vao = gl.createVertexArray();
      if (!vao)
          throw new Error('could not create vertex array object');
      gl.bindVertexArray(vao);
      return vao;
  };
  const WEBGL2_DATA_TYPE = {
      MAT3: 'mat3',
      MAT4: 'mat4',
      VEC2: 'vec2',
      VEC3: 'vec3',
      VEC4: 'vec4',
      FLOAT: 'float',
      INT: 'int',
      SAMPLER_2D: 'sampler2D',
  };
  const ATTRIBUTE = {
      POSITION: { LOCATION: 0, NAME: 'position' },
      UV: { LOCATION: 1, NAME: 'uv' },
      NORMAL: { LOCATION: 2, NAME: 'normal' },
  };
  const UNIFORM = {
      MODEL_MATRIX: 'modelMatrix',
      VIEW_MATRIX: 'viewMatrix',
      PROJECTION_MATRIX: 'projectionMatrix',
      MODEL_VIEW_MATRIX: 'modelViewMatrix',
      MODEL_VIEW_PROJECTION_MATRIX: 'modelViewProjectionMatrix',
      NORMAL_MATRIX: 'normalMatrix',
      CAMERA_POSITION: 'cameraPosition',
      DIR_LIGHT_COUNT: 'dirLightCount',
      DIR_LIGHT_DIRECTION: 'dirLightDirections',
      DIR_LIGHT_COLOR: 'dirLightColors',
      DIR_LIGHT_INTENSITY: 'dirLightIntensities',
  };
  const webgl2TypeValues = Object.values(WEBGL2_DATA_TYPE);
  const createUniformTypeLookupTable = (gl) => ({
      [gl.FLOAT_MAT3]: WEBGL2_DATA_TYPE.MAT3,
      [gl.FLOAT_MAT4]: WEBGL2_DATA_TYPE.MAT4,
      [gl.FLOAT_VEC2]: WEBGL2_DATA_TYPE.VEC2,
      [gl.FLOAT_VEC3]: WEBGL2_DATA_TYPE.VEC3,
      [gl.FLOAT_VEC4]: WEBGL2_DATA_TYPE.VEC4,
      [gl.FLOAT]: WEBGL2_DATA_TYPE.FLOAT,
      [gl.INT]: WEBGL2_DATA_TYPE.INT,
      [gl.SAMPLER_2D]: WEBGL2_DATA_TYPE.SAMPLER_2D,
  });
  const createTexture2D = (gl, image, options) => {
      const texture = gl.createTexture();
      if (!texture)
          throw new Error('could not create texture');
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const defaultOptions = {
          level: 0,
          internalFormat: gl.RGBA,
          srcFormat: gl.RGBA,
          srcType: gl.UNSIGNED_BYTE,
          generateMipmaps: true,
      };
      const texOptions = Object.assign(Object.assign({}, defaultOptions), options);
      gl.texImage2D(gl.TEXTURE_2D, texOptions.level, texOptions.internalFormat, texOptions.srcFormat, texOptions.srcType, image);
      if (texOptions.generateMipmaps)
          gl.generateMipmap(gl.TEXTURE_2D);
      return texture;
  };
  const getActiveAttributes = (gl, program) => {
      const lookupTable = createUniformTypeLookupTable(gl);
      const activeAttributesCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
      const attribs = [];
      for (let i = 0; i < activeAttributesCount; i++) {
          const attributeInfo = gl.getActiveAttrib(program, i);
          attribs.push({
              name: attributeInfo.name,
              type: lookupTable[attributeInfo.type],
          });
      }
      return attribs;
  };
  const getActiveUniforms = (gl, program, material) => {
      const lookupTable = createUniformTypeLookupTable(gl);
      const activeUniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      const uniforms = [];
      const samplers2D = [];
      for (let i = 0; i < activeUniformsCount; i++) {
          const uniformInfo = gl.getActiveUniform(program, i);
          const type = lookupTable[uniformInfo.type];
          const location = gl.getUniformLocation(program, uniformInfo.name);
          if (type === WEBGL2_DATA_TYPE.SAMPLER_2D) {
              samplers2D.push({
                  name: uniformInfo.name,
                  type,
                  location,
                  texture: material.getTexture(gl, uniformInfo.name),
              });
          }
          else {
              uniforms.push({
                  name: uniformInfo.name,
                  type,
                  location,
              });
          }
      }
      return { uniforms, samplers2D };
  };

  const calcDirLight = `
    vec3 CalcDirLight(vec3 lDir, vec3 lDiffuse, float lIntensity, vec3 normal, vec3 viewDir, vec3 diffuseColor, vec3 specularColor) {
        vec3 direction = normalize(lDir);
        float diff = max(dot(normal, direction), 0.0);
        vec3 reflectDir = reflect(-direction, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
        vec3 ambient  = diffuseColor * ambientIntensity;
        vec3 diffuse  = lDiffuse * diff * diffuseColor * lIntensity;
        vec3 specular = lDiffuse * spec * specularColor * lIntensity;
        return ambient + diffuse + specular;
    }
`;
  const getVertexShader = () => `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = ${ATTRIBUTE.POSITION.LOCATION}) in vec3 ${ATTRIBUTE.POSITION.NAME};
    layout(location = ${ATTRIBUTE.UV.LOCATION}) in vec2 ${ATTRIBUTE.UV.NAME};
    layout(location = ${ATTRIBUTE.NORMAL.LOCATION}) in vec3 ${ATTRIBUTE.NORMAL.NAME};

    uniform mat4 ${UNIFORM.MODEL_MATRIX};
    uniform mat4 ${UNIFORM.MODEL_VIEW_MATRIX};
    uniform mat3 ${UNIFORM.NORMAL_MATRIX};
    uniform mat4 ${UNIFORM.PROJECTION_MATRIX};

    out vec3 vPosition;
    out vec2 vUv;
    out vec3 vNormal;

    void main() {
        vUv = ${ATTRIBUTE.UV.NAME};
        vNormal = ${UNIFORM.NORMAL_MATRIX} * normal;
        vPosition = vec3(${UNIFORM.MODEL_MATRIX} * vec4(${ATTRIBUTE.POSITION.NAME}, 1.0));
        gl_Position = ${UNIFORM.PROJECTION_MATRIX} * ${UNIFORM.MODEL_VIEW_MATRIX} * vec4(${ATTRIBUTE.POSITION.NAME}, 1.0);
    }
`.trim();
  const getFragmentShader = (args) => {
      const diffuseDeclaration = args.useDiffuseMap ? 'uniform sampler2D diffuseMap;' : 'uniform vec3 diffuseColor;';
      const specularDeclaration = args.useSpecularMap ? 'uniform sampler2D specularMap;' : 'uniform vec3 specularColor;';
      const diffuseTexelColor = args.useDiffuseMap ? 'vec3 diffuseColor = texture(diffuseMap, vUv).xyz;' : '';
      const specularTexelColor = args.useSpecularMap ? 'vec3 specularColor = texture(specularMap, vUv).xyz;' : '';
      return `
        #version 300 es

        precision highp float;
        precision highp int;

        const int maxDirLights = 5;

        uniform int ${UNIFORM.DIR_LIGHT_COUNT};
        uniform vec3 ${UNIFORM.DIR_LIGHT_DIRECTION}[maxDirLights];
        uniform vec3 ${UNIFORM.DIR_LIGHT_COLOR}[maxDirLights];
        uniform float ${UNIFORM.DIR_LIGHT_INTENSITY}[maxDirLights];

        uniform vec3 ${UNIFORM.CAMERA_POSITION};

        uniform float ambientIntensity;
        ${diffuseDeclaration}
        ${specularDeclaration}
        uniform float specularShininess;
        uniform float opacity;

        in vec3 vPosition;
        in vec2 vUv;
        in vec3 vNormal;

        out vec4 fragmentColor;

        ${calcDirLight}

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(${UNIFORM.CAMERA_POSITION} - vPosition);
            vec3 result = vec3(0.0, 0.0, 0.0);

            ${diffuseTexelColor}
            ${specularTexelColor}

            for(int i = 0; i < ${UNIFORM.DIR_LIGHT_COUNT}; i++) {
                result += CalcDirLight(${UNIFORM.DIR_LIGHT_DIRECTION}[i], ${UNIFORM.DIR_LIGHT_COLOR}[i], ${UNIFORM.DIR_LIGHT_INTENSITY}[i], normal, viewDir, diffuseColor, specularColor);
            }

            fragmentColor = vec4(result, opacity);
        }
    `.trim();
  };
  class PhongMaterial {
      constructor(args = {}) {
          this.ambientIntensity = args.ambientIntensity || 0.1;
          this.diffuseColor = args.diffuseColor || [1, 0, 0];
          this.diffuseMap = args.diffuseMap || null;
          this.specularColor = args.specularColor || [1, 1, 1];
          this.specularMap = args.specularMap || null;
          this.specularShininess = args.specularShininess || 256;
          this.opacity = args.opacity || 1;
          this.dirty = {
              ambientIntensity: true,
              diffuseColor: true,
              diffuseMap: true,
              specularColor: true,
              specularMap: true,
              specularShininess: true,
              opacity: true,
          };
      }
      getUniformValue(uniformName) {
          if (!this.dirty[uniformName])
              return null;
          this.dirty[uniformName] = false;
          return this[uniformName];
      }
      getTexture(gl, uniformName) {
          if (uniformName === 'diffuseMap' && this.diffuseMap) {
              return createTexture2D(gl, this.diffuseMap);
          }
          else if (uniformName === 'specularMap' && this.specularMap) {
              return createTexture2D(gl, this.specularMap);
          }
          else {
              return null;
          }
      }
      getShaderSourceCode({ geometryData }) {
          const useDiffuseMap = !!this.diffuseMap && !!geometryData.uvs;
          const useSpecularMap = !!this.specularMap && !!geometryData.uvs;
          const fragmentShaderArgs = { useDiffuseMap, useSpecularMap };
          return {
              vertexShader: getVertexShader(),
              fragmentShader: getFragmentShader(fragmentShaderArgs),
          };
      }
      setAmbientIntensity(intensity) {
          this.ambientIntensity = intensity;
          this.dirty.ambientIntensity = true;
      }
      setDiffuseColor(r, g, b) {
          this.diffuseColor[0] = r;
          this.diffuseColor[1] = g;
          this.diffuseColor[2] = b;
          this.dirty.diffuseColor = true;
      }
      setSpecularColor(r, g, b) {
          this.specularColor[0] = r;
          this.specularColor[1] = g;
          this.specularColor[2] = b;
          this.dirty.specularColor = true;
      }
      setSpecularShininess(shininess) {
          this.specularShininess = shininess;
          this.dirty.specularShininess = true;
      }
      setOpacity(opacity) {
          this.opacity = opacity;
          this.dirty.opacity = true;
      }
  }

  const getVertexShader$1 = () => `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = 0) in vec3 position;

    uniform mat4 ${UNIFORM.MODEL_VIEW_PROJECTION_MATRIX};

    void main() {
        gl_Position = ${UNIFORM.MODEL_VIEW_PROJECTION_MATRIX} * vec4(position, 1.0);
    }
`.trim();
  const getFragmentShader$1 = () => `
    #version 300 es

    precision highp float;
    precision highp int;

    uniform vec3 color;
    uniform float opacity;

    out vec4 fragmentColor;

    void main() {
        fragmentColor = vec4(color, opacity);
    }
`.trim();
  class UnlitMaterial {
      constructor(args = {}) {
          this.color = args.color || [1, 1, 1];
          this.opacity = args.opacity || 1;
          this.dirty = {
              color: true,
              opacity: true,
          };
      }
      getUniformValue(uniformName) {
          if (!this.dirty[uniformName])
              return null;
          this.dirty[uniformName] = false;
          return this[uniformName];
      }
      getTexture() {
          return null;
      }
      getShaderSourceCode() {
          return {
              vertexShader: getVertexShader$1(),
              fragmentShader: getFragmentShader$1(),
          };
      }
      setColor(r, g, b) {
          this.color[0] = r;
          this.color[1] = g;
          this.color[2] = b;
          this.dirty.color = true;
      }
      setOpacity(opacity) {
          this.opacity = opacity;
          this.dirty.opacity = true;
      }
  }

  class WebGL2FrameState {
      constructor(gl) {
          this.gl = gl;
          this.blendEnabled = gl.isEnabled(gl.BLEND);
          this.cullFaceEnabled = gl.isEnabled(gl.CULL_FACE);
          this.matrixCache = {
              modelView: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              modelViewProjection: fromValues$1(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
              normal: fromValues(1, 0, 0, 0, 1, 0, 0, 0, 1),
          };
          this.dirLightCache = {
              count: 0,
              directions: [],
              colors: [],
              intensities: [],
              countNeedsUpdate: true,
              directionsNeedsUpdate: true,
              colorsNeedsUpdate: true,
              intensitiesNeedsUpdate: true,
          };
      }
      setBlendEnabled(flag) {
          const gl = this.gl;
          if (this.blendEnabled !== flag) {
              this.blendEnabled = flag;
              if (this.blendEnabled) {
                  gl.enable(gl.BLEND);
              }
              else {
                  gl.disable(gl.BLEND);
              }
          }
      }
      setCullFaceEnabled(flag) {
          const gl = this.gl;
          if (this.cullFaceEnabled !== flag) {
              this.cullFaceEnabled = flag;
              if (this.cullFaceEnabled) {
                  gl.enable(gl.CULL_FACE);
              }
              else {
                  gl.disable(gl.CULL_FACE);
              }
          }
      }
      cacheDirectionalLights(dirLights) {
          this.dirLightCache.directions.length = 0;
          this.dirLightCache.colors.length = 0;
          this.dirLightCache.intensities.length = 0;
          this.dirLightCache.countNeedsUpdate = dirLights.length !== this.dirLightCache.count;
          this.dirLightCache.directionsNeedsUpdate = false;
          this.dirLightCache.colorsNeedsUpdate = false;
          this.dirLightCache.intensitiesNeedsUpdate = false;
          this.dirLightCache.count = dirLights.length;
          for (let i = 0; i < dirLights.length; i++) {
              const dirLight = dirLights[i];
              if (dirLight.data.webglDirty.direction)
                  this.dirLightCache.directionsNeedsUpdate = true;
              if (dirLight.data.webglDirty.color)
                  this.dirLightCache.colorsNeedsUpdate = true;
              if (dirLight.data.webglDirty.intensity)
                  this.dirLightCache.intensitiesNeedsUpdate = true;
              for (let j = 0; j < dirLight.data.direction.length; j++)
                  this.dirLightCache.directions.push(dirLight.data.direction[j]);
              for (let j = 0; j < dirLight.data.color.length; j++)
                  this.dirLightCache.colors.push(dirLight.data.color[j]);
              this.dirLightCache.intensities.push(dirLight.data.intensity);
          }
      }
  }

  const UNIFORM_DIR_LIGHT_DIRECTION = `${UNIFORM.DIR_LIGHT_DIRECTION}[0]`;
  const UNIFORM_DIR_LIGHT_COLOR = `${UNIFORM.DIR_LIGHT_COLOR}[0]`;
  const UNIFORM_DIR_LIGHT_INTENSITY = `${UNIFORM.DIR_LIGHT_INTENSITY}[0]`;
  class CachedRenderable {
      constructor(gl, renderable, transform, frameState) {
          this.gl = gl;
          this.renderable = renderable;
          this.transform = transform;
          this.frameState = frameState;
          this.geometryData = renderable.data.geometry.getData();
          const shaderSource = this.renderable.data.material.getShaderSourceCode({ geometryData: this.geometryData });
          this.vertexShader = createShader(gl, gl.VERTEX_SHADER, shaderSource.vertexShader);
          this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderSource.fragmentShader);
          this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
          const attribs = getActiveAttributes(gl, this.program);
          const attributeNames = attribs.map(a => a.name);
          this.buffers = [];
          this.vao = createVertexArray(gl);
          if (attributeNames.includes(ATTRIBUTE.POSITION.NAME) && this.geometryData.positions) {
              this.buffers.push(createArrayBuffer(gl, Float32Array.from(this.geometryData.positions), ATTRIBUTE.POSITION.LOCATION, 3));
          }
          if (attributeNames.includes(ATTRIBUTE.UV.NAME) && this.geometryData.uvs) {
              this.buffers.push(createArrayBuffer(gl, Float32Array.from(this.geometryData.uvs), ATTRIBUTE.UV.LOCATION, 2));
          }
          if (attributeNames.includes(ATTRIBUTE.NORMAL.NAME) && this.geometryData.normals) {
              this.buffers.push(createArrayBuffer(gl, Float32Array.from(this.geometryData.normals), ATTRIBUTE.NORMAL.LOCATION, 3));
          }
          this.indexBuffer = this.geometryData.indices ? createElementArrayBuffer(gl, Uint32Array.from(this.geometryData.indices)) : null;
          const uniformData = getActiveUniforms(gl, this.program, this.renderable.data.material);
          this.activeUniforms = uniformData.uniforms;
          this.activeSamplers2D = uniformData.samplers2D;
          this.forceUniformUpdate = true;
      }
      render(camera, dirLights) {
          const gl = this.gl;
          const transform = this.transform;
          const renderable = this.renderable;
          const frameState = this.frameState;
          const activeUniforms = this.activeUniforms;
          const activeSamplers2D = this.activeSamplers2D;
          gl.useProgram(this.program);
          gl.bindVertexArray(this.vao);
          for (let i = 0; i < activeSamplers2D.length; i++) {
              const sampler2D = activeSamplers2D[i];
              gl.activeTexture(gl.TEXTURE0 + i);
              gl.bindTexture(gl.TEXTURE_2D, sampler2D.texture);
              gl.uniform1i(sampler2D.location, i);
          }
          let modelViewMatrixComputed = false;
          for (let i = 0; i < activeUniforms.length; i++) {
              const uniform = activeUniforms[i];
              if (uniform.name === UNIFORM.MODEL_MATRIX && transform.data.webglDirty.modelMatrix) {
                  gl.uniformMatrix4fv(uniform.location, false, transform.data.modelMatrix);
              }
              else if (uniform.name === UNIFORM.VIEW_MATRIX && (this.forceUniformUpdate || camera.data.webglDirty.viewMatrix)) {
                  gl.uniformMatrix4fv(uniform.location, false, camera.data.viewMatrix);
              }
              else if (uniform.name === UNIFORM.PROJECTION_MATRIX && (this.forceUniformUpdate || camera.data.webglDirty.projectionMatrix)) {
                  gl.uniformMatrix4fv(uniform.location, false, camera.data.projectionMatrix);
              }
              else if (uniform.name === UNIFORM.MODEL_VIEW_MATRIX && (transform.data.webglDirty.modelMatrix || camera.data.webglDirty.viewMatrix)) {
                  if (!modelViewMatrixComputed)
                      multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                  modelViewMatrixComputed = true;
                  gl.uniformMatrix4fv(uniform.location, false, frameState.matrixCache.modelView);
              }
              else if (uniform.name === UNIFORM.MODEL_VIEW_PROJECTION_MATRIX && (transform.data.webglDirty.modelMatrix || camera.data.webglDirty.viewMatrix || camera.data.webglDirty.projectionMatrix)) {
                  if (!modelViewMatrixComputed)
                      multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                  multiply(frameState.matrixCache.modelViewProjection, camera.data.projectionMatrix, frameState.matrixCache.modelView);
                  gl.uniformMatrix4fv(uniform.location, false, frameState.matrixCache.modelViewProjection);
              }
              else if (uniform.name === UNIFORM.NORMAL_MATRIX && (this.forceUniformUpdate || transform.data.webglDirty.modelMatrix || camera.data.webglDirty.viewMatrix)) {
                  if (!modelViewMatrixComputed)
                      multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                  normalFromMat4(frameState.matrixCache.normal, frameState.matrixCache.modelView);
                  gl.uniformMatrix3fv(uniform.location, false, frameState.matrixCache.normal);
              }
              else if (uniform.name === UNIFORM.CAMERA_POSITION && (this.forceUniformUpdate || camera.data.webglDirty.translation)) {
                  gl.uniform3fv(uniform.location, camera.data.translation);
              }
              else if (uniform.name === UNIFORM.DIR_LIGHT_COUNT && (this.forceUniformUpdate || frameState.dirLightCache.countNeedsUpdate)) {
                  gl.uniform1i(uniform.location, dirLights.length);
              }
              else if (uniform.name === UNIFORM_DIR_LIGHT_DIRECTION && (this.forceUniformUpdate || frameState.dirLightCache.directionsNeedsUpdate)) {
                  gl.uniform3fv(uniform.location, frameState.dirLightCache.directions);
              }
              else if (uniform.name === UNIFORM_DIR_LIGHT_COLOR && (this.forceUniformUpdate || frameState.dirLightCache.colorsNeedsUpdate)) {
                  gl.uniform3fv(uniform.location, frameState.dirLightCache.colors);
              }
              else if (uniform.name === UNIFORM_DIR_LIGHT_INTENSITY && (this.forceUniformUpdate || frameState.dirLightCache.intensitiesNeedsUpdate)) {
                  gl.uniform1fv(uniform.location, frameState.dirLightCache.intensities);
              }
              else {
                  const value = renderable.data.material.getUniformValue(uniform.name);
                  if (value !== null) {
                      if (uniform.type === WEBGL2_DATA_TYPE.MAT3) {
                          gl.uniformMatrix3fv(uniform.location, false, value);
                      }
                      else if (uniform.type === WEBGL2_DATA_TYPE.MAT4) {
                          gl.uniformMatrix4fv(uniform.location, false, value);
                      }
                      else if (uniform.type === WEBGL2_DATA_TYPE.VEC2) {
                          gl.uniform2fv(uniform.location, value);
                      }
                      else if (uniform.type === WEBGL2_DATA_TYPE.VEC3) {
                          gl.uniform3fv(uniform.location, value);
                      }
                      else if (uniform.type === WEBGL2_DATA_TYPE.VEC4) {
                          gl.uniform4fv(uniform.location, value);
                      }
                      else if (uniform.type === WEBGL2_DATA_TYPE.FLOAT) {
                          gl.uniform1f(uniform.location, value);
                      }
                      else if (uniform.type === WEBGL2_DATA_TYPE.INT) {
                          gl.uniform1i(uniform.location, value);
                      }
                  }
              }
          }
          if (this.indexBuffer && this.geometryData.indices) {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
              gl.drawElements(gl.TRIANGLES, this.geometryData.indices.length, gl.UNSIGNED_INT, 0);
          }
          else if (this.geometryData.positions) {
              gl.drawArrays(gl.TRIANGLES, 0, this.geometryData.positions.length / 3);
          }
          this.forceUniformUpdate = false;
          transform.resetWebglDirtyFlags();
      }
      cleanup() {
          const gl = this.gl;
          this.activeSamplers2D.forEach(s => gl.deleteTexture(s.texture));
          gl.deleteShader(this.vertexShader);
          gl.deleteShader(this.fragmentShader);
          gl.deleteProgram(this.program);
          this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
          gl.deleteVertexArray(this.vao);
          gl.deleteBuffer(this.indexBuffer);
      }
  }

  const defaultRenderSystemOptions = {
      autoClear: true,
  };
  class WebGL2RenderSystem extends RenderSystem {
      constructor(canvas, cameraEntity, options) {
          super();
          this.canvas = canvas;
          this.cameraEntity = cameraEntity;
          this.options = Object.assign(Object.assign({}, defaultRenderSystemOptions), options);
          this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
          this.gl = getWebGL2Context(canvas, this.options.contextAttributeOptions, this.options.getWebgl2Options);
          this.frameState = new WebGL2FrameState(this.gl);
          this.cachedRenderables = {};
          window.addEventListener('unload', () => {
              Object.keys(this.cachedRenderables).forEach(key => this.cachedRenderables[key].cleanup());
          });
      }
      init() {
          this.world.subscribe(this, [ResizeCanvasEvent]);
      }
      on(event) {
          this.canvas.width = event.payload.width;
          this.canvas.height = event.payload.height;
          this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
          this.render();
      }
      getCachedRenderable(renderable) {
          if (this.cachedRenderables[renderable.entityId])
              return this.cachedRenderables[renderable.entityId];
          const transform = this.world.getComponentByEntityIdAndType(renderable.entityId, Transform);
          const cachedRenderable = new CachedRenderable(this.gl, renderable, transform, this.frameState);
          this.cachedRenderables[renderable.entityId] = cachedRenderable;
          return cachedRenderable;
      }
      render() {
          if (this.options.autoClear)
              this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
          const dirLights = this.world.getComponentsByType(DirectionalLight);
          this.frameState.cacheDirectionalLights(dirLights);
          const renderables = this.world.getComponentsByType(Renderable);
          const renderableCount = renderables.length;
          for (let i = 0; i < renderableCount; i++) {
              const renderable = renderables[i];
              const cachedRenderable = this.getCachedRenderable(renderable);
              cachedRenderable.render(this.activeCamera, dirLights);
          }
          this.activeCamera.resetWebglDirtyFlags();
          for (let i = 0; i < dirLights.length; i++)
              dirLights[i].resetWebglDirtyFlags();
      }
  }

  setMatrixArrayType(Array);

  exports.ATTRIBUTE = ATTRIBUTE;
  exports.Component = Component;
  exports.DirectionalLight = DirectionalLight;
  exports.ECSEvent = ECSEvent;
  exports.Entity = Entity;
  exports.FileLoader = FileLoader;
  exports.ImageLoader = ImageLoader;
  exports.KeyboardInput = KeyboardInput;
  exports.MouseInput = MouseInput;
  exports.OrthographicCamera = OrthographicCamera;
  exports.PerspectiveCamera = PerspectiveCamera;
  exports.PhongMaterial = PhongMaterial;
  exports.QuadGeometry = QuadGeometry;
  exports.RawGeometry = RawGeometry;
  exports.RegisterEntityEvent = RegisterEntityEvent;
  exports.RemoveEntityEvent = RemoveEntityEvent;
  exports.RenderSystem = RenderSystem;
  exports.Renderable = Renderable;
  exports.ResizeCanvasEvent = ResizeCanvasEvent;
  exports.System = System;
  exports.Transform = Transform;
  exports.UNIFORM = UNIFORM;
  exports.UnlitMaterial = UnlitMaterial;
  exports.UpdateCameraSystem = UpdateCameraSystem;
  exports.UpdateTransformSystem = UpdateTransformSystem;
  exports.WEBGL2_DATA_TYPE = WEBGL2_DATA_TYPE;
  exports.WebGL2FrameState = WebGL2FrameState;
  exports.WebGL2RenderSystem = WebGL2RenderSystem;
  exports.World = World;
  exports.createArrayBuffer = createArrayBuffer;
  exports.createElementArrayBuffer = createElementArrayBuffer;
  exports.createProgram = createProgram;
  exports.createShader = createShader;
  exports.createTexture2D = createTexture2D;
  exports.createUniformTypeLookupTable = createUniformTypeLookupTable;
  exports.createVertexArray = createVertexArray;
  exports.defaultContextAttributeOptions = defaultContextAttributeOptions;
  exports.getActiveAttributes = getActiveAttributes;
  exports.getActiveUniforms = getActiveUniforms;
  exports.getDefaultWebGL2Options = getDefaultWebGL2Options;
  exports.getWebGL2Context = getWebGL2Context;
  exports.parseObjFile = parseObjFile;
  exports.webgl2TypeValues = webgl2TypeValues;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
