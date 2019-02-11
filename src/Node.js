import { vec3, quat, mat4 } from 'gl-matrix';

export default class Node {
    constructor() {
        this.parent = null;
        this.children = [];
        this.position = vec3.fromValues(0, 0, 0);
        this.scaling = vec3.fromValues(1, 1, 1);
        this.quaternion = quat.create();
        this.transformDirty = false;
        this.modelMatrix = mat4.create();
    }

    getChildren({ recursive } = {}) {
        let children = [];

        let i = 0;
        const iMax = this.children.length;

        for (; i < iMax; i++) {
            children.push(this.children[i]);

            if (recursive) {
                const childChildren = this.children[i].getChildren({ recursive });
                children = children.concat(childChildren);
            }
        }
        return children;
    }

    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    translate(x, y, z) {
        this.position = vec3.add(vec3.create(), this.position, vec3.fromValues(x, y, z));
        this.transformDirty = true;
    }

    scale(x, y, z) {
        this.scaling = vec3.add(vec3.create(), this.scaling, vec3.fromValues(x, y, z));
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quaternion = quat.fromEuler(quat.create(), x, y, z);
        this.quaternion = quat.multiply(quat.create(), this.quaternion, quaternion);
        this.transformDirty = true;
    }

    computeModelMatrix(parentMatrix) {
        const pos = this.position;
        const scl = this.scaling;
        const rot = this.quaternion;

        if (parentMatrix) {
            if (this.transformDirty) {
                const transformationMatrix = mat4.fromRotationTranslationScale(mat4.create(), rot, pos, scl);
                this.modelMatrix = mat4.multiply(mat4.create(), parentMatrix, transformationMatrix);
            } else {
                this.modelMatrix = mat4.multiply(mat4.create(), parentMatrix, this.modelMatrix);
            }
        } else {
            if (this.transformDirty) { // eslint-disable-line
                this.modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), rot, pos, scl);
            }
        }

        let i = 0;
        const iMax = this.children.length;

        for (; i < iMax; i++) {
            if (parentMatrix || this.transformDirty) {
                this.children[i].computeModelMatrix(this.modelMatrix);
            } else {
                this.children[i].computeModelMatrix();
            }
        }
    }
}
