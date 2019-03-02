import { vec3, quat, mat3, mat4 } from 'gl-matrix';

const MathUtils = {
    createVec3: (x = 0, y = 0, z = 0) => vec3.fromValues(x, y, z),
    createQuat: (x, y, z, w) => quat.fromValues(x, y, z, w),
    createMat4: () => mat4.create(),
    addVec3: (out, vec1, vec2) => vec3.add(out, vec1, vec2),
    quatFromEuler: (out, x, y, z) => quat.fromEuler(out, x, y, z),
    multiplyQuat: (out, quat1, quat2) => quat.multiply(out, quat1, quat2),
    mat4LookAt: (out, pos, lookAt, upVector) => mat4.lookAt(out, pos, lookAt, upVector),
    mat4Perspective: (out, fov, aspect, near, far) => mat4.perspective(out, fov, aspect, near, far),
    mat4Ortho: (out, left, right, bottom, top, near, far) => mat4.ortho(out, left, right, bottom, top, near, far),
    copyMat4: (out, matToCopy) => mat4.copy(out, matToCopy),
    multiplyMat4: (out, mat1, mat2) => mat4.multiply(out, mat1, mat2),
    mat4FromQuatPosScl: (out, rot, pos, scl) => mat4.fromRotationTranslationScale(out, rot, pos, scl),
    normalMatFromMat4: (out, _mat4) => mat3.normalFromMat4(out, _mat4),
    createMat3: () => mat3.create(),
};

export default MathUtils;
