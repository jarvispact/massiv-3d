import { mat4 } from 'gl-matrix';
import { MouseInput, System, World } from '../../../src';
import { PerspectiveCamera } from '../components/perspective-camera';

type CameraControlArgs = {
    world: World;
    canvas: HTMLCanvasElement;
};

export const createTrackballCameraControlSystem = ({ world, canvas }: CameraControlArgs): System => {
    const mouseInput = new MouseInput(canvas);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let camera: PerspectiveCamera = null;

    let lastMouseX = 0;
    let lastMouseY = 0;

    const mat4CacheX = mat4.create();
    const mat4CacheY = mat4.create();

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const perspectiveCamera = action.payload.getComponentByClass(PerspectiveCamera);
            if (perspectiveCamera) {
                camera = perspectiveCamera;
            }
        }
    });

    return (delta) => {
        const mouseX = mouseInput.getMouseX();
        const mouseY = mouseInput.getMouseY();

        const movementX = (mouseX - lastMouseX) * delta;
        const movementY = (lastMouseY - mouseY) * delta;

        if (mouseInput.isButtonDown('AUXILIARY')) {
            mat4.lookAt(camera.data.viewMatrix, camera.data.translation, [0, 0, 0], camera.data.upVector);
            mat4.rotateY(mat4CacheY, mat4CacheY, movementX);
            mat4.rotateX(mat4CacheX, mat4CacheX, -movementY);
            mat4.multiply(camera.data.viewMatrix, camera.data.viewMatrix, mat4CacheX);
            mat4.multiply(camera.data.viewMatrix, camera.data.viewMatrix, mat4CacheY);
            camera.data.dirty = true;
        }

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    };
};