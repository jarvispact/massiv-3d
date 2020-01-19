import { mat4 } from 'gl-matrix';
import Component from './component';

const updateTransform = (world) => {
    const transforms = world.findComponentsByType(Component.types.TRANSFORM_3D);
    for (let i = 0; i < transforms.length; i++) {
        const t = transforms[i];
        mat4.fromRotationTranslationScale(t.modelMatrix, t.quaternion, t.position, t.scale);
    }
};

const updatePerspectiveCamera = (world) => {
    const cameras = world.findComponentsByType(Component.types.PERSPECTIVE_CAMERA);
    for (let i = 0; i < cameras.length; i++) {
        const c = cameras[i];
        const t = world.findComponentByEntityId(c.entityId, [Component.types.TRANSFORM_3D]);
        mat4.lookAt(c.viewMatrix, t.position, c.lookAt, c.upVector);
        mat4.perspective(c.projectionMatrix, c.fov, c.aspect, c.near, c.far);
    }
};

const updateOrbitControlSystem = (world, delta) => {
    const inputManager = world.getInputManager();
    const orbitControls = world.findComponentsByType(Component.types.ORBIT_CAMERA_CONTROL);
    for (let i = 0; i < orbitControls.length; i++) {
        const orbitControl = orbitControls[i];
        const c = world.findComponentByEntityId(orbitControl.entityId, [Component.types.PERSPECTIVE_CAMERA]);
        const t = world.findComponentByEntityId(orbitControl.entityId, [Component.types.TRANSFORM_3D]);

        const x = t.position[0];
        const z = t.position[2];

        if (inputManager.isKeyDown('ArrowLeft')) {
            t.position[0] = x * Math.cos(orbitControl.speed * delta) + z * Math.sin(orbitControl.speed * delta);
            t.position[2] = z * Math.cos(orbitControl.speed * delta) - x * Math.sin(orbitControl.speed * delta);
        }

        if (inputManager.isKeyDown('ArrowRight')) {
            t.position[0] = x * Math.cos(orbitControl.speed * delta) - z * Math.sin(orbitControl.speed * delta);
            t.position[2] = z * Math.cos(orbitControl.speed * delta) + x * Math.sin(orbitControl.speed * delta);
        }

        mat4.lookAt(c.viewMatrix, t.position, [0, 0, 0], c.upVector);
    }
};

const System = {
    updateTransform,
    updatePerspectiveCamera,
    updateOrbitControlSystem,
};

export default System;
