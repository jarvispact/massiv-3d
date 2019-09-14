import uuid from '../utils/uuid';

class Node {
    constructor({ id } = {}) {
        this.id = id || uuid();
        this.parent = null;
        this.children = [];
    }

    getParent() {
        return this.parent;
    }

    setParent(parent) {
        this.parent = parent;
        return this;
    }

    addChild(child) {
        child.setParent(this);
        this.children.push(child);
    }

    addChildren(children) {
        for (let i = 0; i < children.length; i++) {
            children[i].setParent(this);
        }

        this.children.push(...children);
    }

    getChildren() {
        return this.children;
    }
}

export default Node;
