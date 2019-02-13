import { vec3, quat, mat4 } from 'gl-matrix';

export const createVec3 = (x = 0, y = 0, z = 0) => vec3.fromValues(x, y, z);

export const createQuat = (x, y, z, w) => quat.fromValues(x, y, z, w);

export const createMat4 = () => mat4.create();

export const addVec3 = (out, vec1, vec2) => vec3.add(out, vec1, vec2);

export const quatFromEuler = (out, x, y, z) => quat.fromEuler(out, x, y, z);

export const multiplyQuat = (out, quat1, quat2) => quat.multiply(out, quat1, quat2);

export const mat4LookAt = (out, pos, lookAt, upVector) => mat4.lookAt(out, pos, lookAt, upVector);

export const mat4Perspective = (out, fov, aspect, near, far) => mat4.perspective(out, fov, aspect, near, far);

export const mat4Ortho = (out, left, right, bottom, top, near, far) => mat4.ortho(out, left, right, bottom, top, near, far);

export const copyMat4 = (out, matToCopy) => mat4.copy(out, matToCopy);

// export const multiplyMat4 = (out, mat1, mat2) => mat4.multiply(out, mat1, mat2);

// export const mat4FromQuatPosScl = (out, rot, pos, scl) => mat4.fromRotationTranslationScale(out, rot, pos, scl);
