import { mat4 } from 'gl-matrix';

const updateModelMatrix = (transform3D) => {
    mat4.fromRotationTranslationScale(transform3D.modelMatrix, transform3D.quaternion, transform3D.position, transform3D.scale);
};

const updateViewMatrix = (camera) => {
    mat4.lookAt(camera.viewMatrix, camera.position, camera.lookAt, camera.upVector);
};

const updatePerspectiveProjectionMatrix = (camera) => {
    mat4.perspective(camera.projectionMatrix, camera.fov, camera.aspect, camera.near, camera.far);
};

const System = {
    updateModelMatrix,
    updateViewMatrix,
    updatePerspectiveProjectionMatrix,
};

export default System;
