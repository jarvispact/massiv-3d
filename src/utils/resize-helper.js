import ComponentTypes from '../components/component-types';

const resizeHelper = (canvas, renderer, camera, world) => {
    const perspectiveCamera = camera.getComponent(ComponentTypes.PERSPECTIVE_CAMERA);
    if (perspectiveCamera) {
        perspectiveCamera.aspect = canvas.clientWidth / canvas.clientHeight;
        perspectiveCamera.updateProjectionMatrix();
    }

    const orthographicCamera = camera.getComponent(ComponentTypes.ORTHOGRAPHIC_CAMERA);
    if (orthographicCamera) {
        orthographicCamera.updateProjectionMatrix();
    }

    renderer.resize();
    renderer.render(world);
};

export default resizeHelper;
