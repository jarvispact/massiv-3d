import Transform3D from './transform-3d';
import Camera from '../camera/camera';
import Mesh from './mesh';

class Scene extends Transform3D {
    constructor() {
        super();
        this.activeCamera = null;
    }

    setActiveCamera(camera) {
        this.activeCamera = camera;
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    getChildrenRecursive() {
        let flatChildrenList = this.getChildren();

        for (let i = 0; i < flatChildrenList.length; i++) {
            const child = flatChildrenList[i];
            flatChildrenList = flatChildrenList.concat(child.getChildren());
        }

        const cameras = [];
        const meshes = [];

        for (let i = 0; i < flatChildrenList.length; i++) {
            const child = flatChildrenList[i];
            if (child instanceof Camera) cameras.push(child);
            if (child instanceof Mesh) meshes.push(child);
        }

        return {
            activeCamera: this.activeCamera || cameras[0],
            cameras,
            meshes,
        };
    }
}

export default Scene;
