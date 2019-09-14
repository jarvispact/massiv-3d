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
    }

    addChild(child) {
        child.setParent(this);
        this.children.push(child);
    }

    getChildren() {
        return this.children;
    }
}

export default Node;
