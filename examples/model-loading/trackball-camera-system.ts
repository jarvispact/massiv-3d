import { mat4, vec3 } from 'gl-matrix';
import { MouseInput, System } from '../../src';

type Camera = {
    getTranslation: () => vec3;
    getLookAt: () => vec3,
    getUpVector: () => vec3,
    setViewMatrix: (mat: mat4) => void;
    update: (translation: vec3) => void;
};

export const createTrackballCameraSystem = (camera: Camera, mouseInput: MouseInput): System => {
    let lastMouseX = 0;
    let lastMouseY = 0;
    const translation: vec3 = [0, 0, 5];

    const viewMatrix = mat4.create();
    const mat4CacheX = mat4.create();
    const mat4CacheY = mat4.create();

    mat4.lookAt(viewMatrix, translation, [0, 0, 0], [0, 1, 0]);

    return (delta: number) => {
        const mouseX = mouseInput.getMouseX();
        const mouseY = mouseInput.getMouseY();

        const movementX = (mouseX - lastMouseX) * delta;
        const movementY = (lastMouseY - mouseY) * delta;

        if (mouseInput.isButtonDown('PRIMARY')) {
            mat4.lookAt(viewMatrix, translation, [0, 0, 0], [0, 1, 0]);
            mat4.rotateY(mat4CacheY, mat4CacheY, movementX);
            mat4.rotateX(mat4CacheX, mat4CacheX, -movementY);
            mat4.multiply(viewMatrix, viewMatrix, mat4CacheX);
            mat4.multiply(viewMatrix, viewMatrix, mat4CacheY);
            camera.setViewMatrix(viewMatrix);
        }

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    };
};