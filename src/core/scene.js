import Node from './node';
import Camera from '../camera/camera';
import Mesh from './mesh';

class Scene extends Node {
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
            cameras,
            activeCamera: this.activeCamera || cameras[0],
            meshes,
        }
    }
}

export default Scene;
