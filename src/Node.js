import { createVec3, createQuat, createMat4, addVec3, quatFromEuler, multiplyQuat, multiplyMat4, mat4FromQuatPosScl } from '../utils/math-utils';

export default class Node {
    constructor() {
        this.parent = null;
        this.children = [];
        this.position = createVec3();
        this.scaling = createVec3(1, 1, 1);
        this.quaternion = createQuat(0, 0, 0, 1);
        this.transformDirty = false;
        this.modelMatrix = createMat4();
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
        this.position = addVec3(this.position, this.position, createVec3(x, y, z));
        this.transformDirty = true;
    }

    scale(x, y, z) {
        this.scaling = addVec3(this.scaling, this.scaling, createVec3(x, y, z));
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quaternion = quatFromEuler(createQuat(), x, y, z);
        this.quaternion = multiplyQuat(this.quaternion, this.quaternion, quaternion);
        this.transformDirty = true;
    }

    computeModelMatrix(parentMatrix) {
        const pos = this.position;
        const scl = this.scaling;
        const rot = this.quaternion;

        if (parentMatrix) {
            if (this.transformDirty) {
                const transformationMatrix = mat4FromQuatPosScl(createMat4(), rot, pos, scl);
                this.modelMatrix = multiplyMat4(this.modelMatrix, parentMatrix, transformationMatrix);
            } else {
                this.modelMatrix = multiplyMat4(this.modelMatrix, parentMatrix, this.modelMatrix);
            }
        } else {
            if (this.transformDirty) { // eslint-disable-line
                this.modelMatrix = mat4FromQuatPosScl(this.modelMatrix, rot, pos, scl);
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
