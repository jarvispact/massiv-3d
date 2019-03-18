import Node3D from './node-3d';
import DirectionalLight from './directional-light';
import OrthographicCamera from './orthographic-camera';
import PerspectiveCamera from './perspective-camera';
import Mesh from './mesh';

export default class Scene extends Node3D {
    constructor() {
        super();
        this.activeCamera = null;
    }

    getChildren({ recursive } = {}) {
        const { activeCamera } = this;
        let flatChildren = this.children;

        flatChildren.forEach((child) => {
            flatChildren = flatChildren.concat(child.getChildren({ recursive }));
        });

        const directionalLights = [];
        const orthographicCameras = [];
        const perspectiveCameras = [];
        const meshes = [];

        flatChildren.forEach((child) => {
            if (child instanceof DirectionalLight) directionalLights.push(child);
            if (child instanceof OrthographicCamera) orthographicCameras.push(child);
            if (child instanceof PerspectiveCamera) perspectiveCameras.push(child);
            if (child instanceof Mesh) meshes.push(child);
        });

        return {
            directionalLights,
            orthographicCameras,
            perspectiveCameras,
            activeCamera,
            meshes,
        };
    }

    setActiveCamera(camera) {
        this.activeCamera = camera;
    }
}
