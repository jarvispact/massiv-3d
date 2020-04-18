'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
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

function fromValues$1(x, y, z) {
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

function fromValues$2(x, y, z, w) {
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

var fromValues$3 = fromValues$2;
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
  var xUnitVec3 = fromValues$1(1, 0, 0);
  var yUnitVec3 = fromValues$1(0, 1, 0);
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

const type = 'OrthographicCamera';
class OrthographicCamera extends Component {
    constructor(args) {
        super(type, {
            position: args.position,
            lookAt: args.lookAt ? args.lookAt : fromValues$1(0, 0, 0),
            upVector: args.upVector ? args.upVector : fromValues$1(0, 1, 0),
            viewMatrix: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            projectionMatrix: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: {
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
    translate(translation) {
        add(this.data.position, this.data.position, translation);
        this.data.dirty.viewMatrix = true;
    }
    update() {
        if (this.data.dirty.viewMatrix) {
            lookAt(this.data.viewMatrix, this.data.position, this.data.lookAt, this.data.upVector);
            this.data.dirty.viewMatrix = false;
        }
        if (this.data.dirty.projectionMatrix) {
            ortho(this.data.projectionMatrix, this.data.left, this.data.right, this.data.bottom, this.data.top, this.data.near, this.data.far);
            this.data.dirty.projectionMatrix = false;
        }
    }
}

const type$1 = 'PerspectiveCamera';
class PerspectiveCamera extends Component {
    constructor(args) {
        super(type$1, {
            position: args.position,
            lookAt: args.lookAt ? args.lookAt : fromValues$1(0, 0, 0),
            upVector: args.upVector ? args.upVector : fromValues$1(0, 1, 0),
            viewMatrix: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            projectionMatrix: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: {
                viewMatrix: true,
                projectionMatrix: true,
            },
            fov: args.fov || 45,
            aspect: args.aspect,
            near: args.near || 0.1,
            far: args.far || 1000,
        });
    }
    translate(translation) {
        add(this.data.position, this.data.position, translation);
        this.data.dirty.viewMatrix = true;
    }
    setAspect(aspect) {
        this.data.aspect = aspect;
        this.data.dirty.projectionMatrix = true;
    }
    update() {
        if (this.data.dirty.viewMatrix) {
            lookAt(this.data.viewMatrix, this.data.position, this.data.lookAt, this.data.upVector);
            this.data.dirty.viewMatrix = false;
        }
        if (this.data.dirty.projectionMatrix) {
            perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
            this.data.dirty.projectionMatrix = false;
        }
    }
}

const type$2 = 'Renderable';
class Renderable extends Component {
    constructor(args) {
        super(type$2, args);
    }
}

const type$3 = 'Transform';
class Transform extends Component {
    constructor(args = {}) {
        super(type$3, {
            position: args.position || fromValues$1(0, 0, 0),
            scaling: args.scaling || fromValues$1(1, 1, 1),
            quaternion: args.quaternion || fromValues$3(0, 0, 0, 1),
            rotationCache: create$3(),
            modelMatrix: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            dirty: {
                modelMatrix: true,
            }
        });
    }
    translate(translation) {
        add(this.data.position, this.data.position, translation);
        this.data.dirty.modelMatrix = true;
    }
    scale(scaling) {
        add(this.data.scaling, this.data.scaling, scaling);
        this.data.dirty.modelMatrix = true;
    }
    rotate(eulerRotation) {
        fromEuler(this.data.rotationCache, eulerRotation[0], eulerRotation[1], eulerRotation[2]);
        multiply$1(this.data.quaternion, this.data.quaternion, this.data.rotationCache);
        this.data.dirty.modelMatrix = true;
    }
    update() {
        if (this.data.dirty.modelMatrix) {
            fromRotationTranslationScale(this.data.modelMatrix, this.data.quaternion, this.data.position, this.data.scaling);
            this.data.dirty.modelMatrix = false;
        }
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

class Geometry {
    constructor(args = {}) {
        this.positions = args.positions || [];
        this.uvs = args.uvs || [];
        this.normals = args.normals || [];
        this.indices = args.indices || [];
        this.colors = args.colors || [];
    }
}

class Material {
    constructor() {
        this.blendEnabled = false;
        this.cullFaceEnabled = false;
    }
}

class System {
}
class RenderSystem {
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
class World {
    constructor() {
        this.getDelta = createGetDelta();
        this.componentsByType = {};
        this.componentsByEntityId = {};
        this.subscriptions = {};
        this.systems = [];
        this.renderSystems = [];
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
        return this.componentsByType[klass.name];
    }
    getComponentsByEntityId(entityId) {
        return this.componentsByEntityId[entityId];
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

const type$4 = 'RegisterEntityEvent';
class RegisterEntityEvent extends ECSEvent {
    constructor(entity) {
        super(type$4, entity);
    }
}

const type$5 = 'RemoveEntityEvent';
class RemoveEntityEvent extends ECSEvent {
    constructor(entity) {
        super(type$5, entity);
    }
}

class QuadGeometry extends Geometry {
    constructor() {
        super({
            positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            indices: [0, 1, 2, 0, 2, 3],
        });
    }
}

const ImageLoader = {
    load: async (imageSrcUrl) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`error loading image from url: "${imageSrcUrl}"`));
        img.src = imageSrcUrl;
    }),
};

class UnlitMaterial extends Material {
    constructor(args = {}) {
        super();
        this.color = args.color || [1, 1, 1];
        this.opacity = args.opacity || 1.0;
    }
}

class FpsDebugSystem extends RenderSystem {
    constructor() {
        super();
        this.fpsDisplay = document.createElement('p');
        this.fpsDisplay.style.position = 'fixed';
        this.fpsDisplay.style.top = '10px';
        this.fpsDisplay.style.left = '10px';
        this.fpsDisplay.style.color = '#FFFFFF';
        this.fpsDisplay.style.zIndex = '10';
        document.body.appendChild(this.fpsDisplay);
        this.oneSecond = Date.now() + 1000;
        this.fps = 0;
    }
    render() {
        this.fps++;
        const currentTime = Date.now();
        if (currentTime >= this.oneSecond) {
            this.fpsDisplay.textContent = `FPS: ${this.fps}`;
            this.fps = 0;
            this.oneSecond = currentTime + 1000;
        }
    }
}

class UpdateTransformSystem extends System {
    update() {
        const transforms = this.world.getComponentsByType(Transform);
        for (let i = 0; i < transforms.length; i++)
            transforms[i].update();
    }
}

const defaultContextAttributeOptions = {
    premultipliedAlpha: false,
    alpha: false,
    powerPreference: 'high-performance',
    antialias: false,
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
const createVertexArray = (gl, cb) => {
    const vao = gl.createVertexArray();
    if (!vao)
        throw new Error('could not create vertex array object');
    gl.bindVertexArray(vao);
    const buffers = cb();
    return [vao, buffers];
};
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

const vShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = 0) in vec3 position;

    uniform mat4 mvp;

    void main() {
        gl_Position = mvp * vec4(position, 1.0);
    }
`.trim();
const fShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    out vec4 fragmentColor;

    void main() {
        fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`.trim();
class CachedRenderable {
    constructor(gl, renderable, transform, frameState) {
        this.gl = gl;
        this.renderable = renderable;
        this.transform = transform;
        this.frameState = frameState;
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
        const [vao, buffers] = createVertexArray(gl, () => {
            const positionBuffer = createArrayBuffer(gl, Float32Array.from(renderable.data.geometry.positions), 0, 3);
            return [positionBuffer];
        });
        this.vao = vao;
        this.buffers = buffers;
        this.indexBuffer = createElementArrayBuffer(gl, Uint32Array.from(renderable.data.geometry.indices));
        this.mvpLocation = gl.getUniformLocation(this.program, 'mvp');
    }
    render(camera) {
        const gl = this.gl;
        const frameState = this.frameState;
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);
        camera.update();
        multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, this.transform.data.modelMatrix);
        multiply(frameState.matrixCache.modelViewProjection, camera.data.projectionMatrix, frameState.matrixCache.modelView);
        gl.uniformMatrix4fv(this.mvpLocation, false, frameState.matrixCache.modelViewProjection);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.renderable.data.geometry.indices.length, gl.UNSIGNED_INT, 0);
    }
    cleanup() {
        const gl = this.gl;
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        gl.deleteProgram(this.program);
        this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.indexBuffer);
    }
}

class FrameState {
    constructor(gl) {
        this.gl = gl;
        this.blendEnabled = gl.isEnabled(gl.BLEND);
        this.cullFaceEnabled = gl.isEnabled(gl.CULL_FACE);
        this.matrixCache = {
            modelView: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            modelViewProjection: fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
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
}

const defaultOptions = {
    autoClear: true,
};
class WebGL2RenderSystem extends RenderSystem {
    constructor(canvas, cameraEntity, options = {}) {
        super();
        this.canvas = canvas;
        this.cameraEntity = cameraEntity;
        this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        this.gl = getWebGL2Context(canvas, options.contextAttributeOptions, options.getWebGL2Options);
        this.frameState = new FrameState(this.gl);
        this.cachedRenderables = {};
        window.addEventListener('unload', () => {
            Object.keys(this.cachedRenderables).forEach(key => this.cachedRenderables[key].cleanup());
        });
    }
    setActiveCameraEntity(cameraEntity) {
        this.cameraEntity = cameraEntity;
        this.activeCamera = cameraEntity.getComponent(PerspectiveCamera) || cameraEntity.getComponent(OrthographicCamera);
        return this;
    }
    getCachedRenderable(renderable, transform) {
        if (this.cachedRenderables[renderable.entityId])
            return this.cachedRenderables[renderable.entityId];
        const cachedRenderable = new CachedRenderable(this.gl, renderable, transform, this.frameState);
        this.cachedRenderables[renderable.entityId] = cachedRenderable;
        return cachedRenderable;
    }
    render() {
        const gl = this.gl;
        const options = this.options;
        const frameState = this.frameState;
        const activeCamera = this.activeCamera;
        if (options.autoClear)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        frameState.setBlendEnabled(false);
        frameState.setCullFaceEnabled(false);
        const renderables = this.world.getComponentsByType(Renderable);
        const renderablesCount = renderables.length;
        for (let i = 0; i < renderablesCount; i++) {
            const renderable = renderables[i];
            const transform = this.world.getComponentByEntityIdAndType(renderable.entityId, Transform);
            const cachedRenderable = this.getCachedRenderable(renderable, transform);
            cachedRenderable.render(activeCamera);
        }
    }
}

setMatrixArrayType(Array);

exports.Component = Component;
exports.ECSEvent = ECSEvent;
exports.Entity = Entity;
exports.FpsDebugSystem = FpsDebugSystem;
exports.Geometry = Geometry;
exports.ImageLoader = ImageLoader;
exports.Material = Material;
exports.OrthographicCamera = OrthographicCamera;
exports.PerspectiveCamera = PerspectiveCamera;
exports.QuadGeometry = QuadGeometry;
exports.RegisterEntityEvent = RegisterEntityEvent;
exports.RemoveEntityEvent = RemoveEntityEvent;
exports.RenderSystem = RenderSystem;
exports.Renderable = Renderable;
exports.System = System;
exports.Transform = Transform;
exports.UnlitMaterial = UnlitMaterial;
exports.UpdateTransformSystem = UpdateTransformSystem;
exports.WebGL2RenderSystem = WebGL2RenderSystem;
exports.World = World;
exports.createArrayBuffer = createArrayBuffer;
exports.createElementArrayBuffer = createElementArrayBuffer;
exports.createProgram = createProgram;
exports.createShader = createShader;
exports.createTexture2D = createTexture2D;
exports.createVertexArray = createVertexArray;
exports.defaultContextAttributeOptions = defaultContextAttributeOptions;
exports.getDefaultWebGL2Options = getDefaultWebGL2Options;
exports.getWebGL2Context = getWebGL2Context;
