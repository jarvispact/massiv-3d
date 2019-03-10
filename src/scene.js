import Node from './node';
import Mesh from './mesh';

export default class Scene extends Node {
    getChildren({ recursive } = {}) {
        let children = [];

        for (let i = 0; i < this.children.length; i++) {
            const currentChild = this.children[i];
            children.push(currentChild);

            if (recursive) {
                const childChildren = currentChild.getChildren({ recursive });
                children = children.concat(childChildren);
            }
        }

        const meshes = [];

        for (let i = 0; i < children.length; i++) {
            if (children[i] instanceof Mesh) meshes.push(children[i]);
        }

        return { meshes };
    }
}
