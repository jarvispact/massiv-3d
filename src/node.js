import MathUtils from './math-utils';

export default class Node {
    constructor() {
        this.parent = null;
        this.children = [];
        this.position = MathUtils.createVec3();
        this.scaling = MathUtils.createVec3(1, 1, 1);
        this.quaternion = MathUtils.createQuat(0, 0, 0, 1);
        this.transformDirty = false;
        this.modelMatrix = MathUtils.createMat4();
    }

    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

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

        return children;
    }

    translate(x, y, z) {
        this.position = MathUtils.addVec3(this.position, this.position, MathUtils.createVec3(x, y, z));
        this.transformDirty = true;
    }

    scale(x, y, z) {
        this.scaling = MathUtils.addVec3(this.scaling, this.scaling, MathUtils.createVec3(x, y, z));
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quaternion = MathUtils.quatFromEuler(MathUtils.createQuat(), x, y, z);
        this.quaternion = MathUtils.multiplyQuat(this.quaternion, this.quaternion, quaternion);
        this.transformDirty = true;
    }

    computeModelMatrix(parentMatrix) {
        const pos = this.position;
        const scl = this.scaling;
        const rot = this.quaternion;

        if (parentMatrix) {
            if (this.transformDirty) {
                const transformationMatrix = MathUtils.mat4FromQuatPosScl(MathUtils.createMat4(), rot, pos, scl);
                this.modelMatrix = MathUtils.multiplyMat4(this.modelMatrix, parentMatrix, transformationMatrix);
            } else {
                this.modelMatrix = MathUtils.multiplyMat4(this.modelMatrix, parentMatrix, this.modelMatrix);
            }
        } else {
            if (this.transformDirty) { // eslint-disable-line
                this.modelMatrix = MathUtils.mat4FromQuatPosScl(this.modelMatrix, rot, pos, scl);
            }
        }

        for (let i = 0; i < this.children.length; i++) {
            if (parentMatrix || this.transformDirty) {
                this.children[i].computeModelMatrix(this.modelMatrix);
            } else {
                this.children[i].computeModelMatrix();
            }
        }
    }
}
