/* eslint-disable no-bitwise, no-nested-ternary, no-mixed-operators */

// https://gist.github.com/jcxplorer/823878

var uuid = () => {
    let uuid = '';
    let i = 0;

    for (i; i < 32; i++) {
        const random = Math.random() * 16 | 0;

        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += '-';
        }

        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
};

class Node {
    constructor() {
        this.id = uuid();
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

/* eslint-disable prefer-destructuring, one-var, one-var-declaration-per-line, max-len */

const EPSILON = 0.000001;

class Mat4 {
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 0, m05 = 1, m06 = 0, m07 = 0, m08 = 0, m09 = 0, m10 = 1, m11 = 0, m12 = 0, m13 = 0, m14 = 0, m15 = 1) {
        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m03 = m03;
        this.m04 = m04;
        this.m05 = m05;
        this.m06 = m06;
        this.m07 = m07;
        this.m08 = m08;
        this.m09 = m09;
        this.m10 = m10;
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m14 = m14;
        this.m15 = m15;
    }

    setIdentity() {
        this.m00 = 1;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = 1;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m10 = 1;
        this.m11 = 0;
        this.m12 = 0;
        this.m13 = 0;
        this.m14 = 0;
        this.m15 = 1;

        return this;
    }

    getAsArray() {
        return [
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
            this.m09,
            this.m10,
            this.m11,
            this.m12,
            this.m13,
            this.m14,
            this.m15,
        ];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(mat4) {
        this.m00 = mat4[0];
        this.m01 = mat4[1];
        this.m02 = mat4[2];
        this.m03 = mat4[3];
        this.m04 = mat4[4];
        this.m05 = mat4[5];
        this.m06 = mat4[6];
        this.m07 = mat4[7];
        this.m08 = mat4[8];
        this.m09 = mat4[9];
        this.m10 = mat4[10];
        this.m11 = mat4[11];
        this.m12 = mat4[12];
        this.m13 = mat4[13];
        this.m14 = mat4[14];
        this.m15 = mat4[15];
        return this;
    }

    clone() {
        return new Mat4(
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
            this.m09,
            this.m10,
            this.m11,
            this.m12,
            this.m13,
            this.m14,
            this.m15,
        );
    }

    multiply(mat4) {
        const a00 = this.m00, a01 = this.m01, a02 = this.m02, a03 = this.m03;
        const a10 = this.m04, a11 = this.m05, a12 = this.m06, a13 = this.m07;
        const a20 = this.m08, a21 = this.m09, a22 = this.m10, a23 = this.m11;
        const a30 = this.m12, a31 = this.m13, a32 = this.m14, a33 = this.m15;

        // Cache only the current line of the second matrix
        let b0 = mat4.m00, b1 = mat4.m01, b2 = mat4.m02, b3 = mat4.m03;
        this.m00 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m01 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m02 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m03 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = mat4.m04; b1 = mat4.m05; b2 = mat4.m06; b3 = mat4.m07;
        this.m04 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m05 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m06 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m07 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = mat4.m08; b1 = mat4.m09; b2 = mat4.m10; b3 = mat4.m11;
        this.m08 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m09 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m10 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m11 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = mat4.m12; b1 = mat4.m13; b2 = mat4.m14; b3 = mat4.m15;
        this.m12 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m13 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m14 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m15 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return this;
    }

    setFromQuaternionTranslationScale(quat, pos, scl) {
        const x = quat.x, y = quat.y, z = quat.z, w = quat.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = scl.x;
        const sy = scl.y;
        const sz = scl.z;

        this.m00 = (1 - (yy + zz)) * sx;
        this.m01 = (xy + wz) * sx;
        this.m02 = (xz - wy) * sx;
        this.m03 = 0;
        this.m04 = (xy - wz) * sy;
        this.m05 = (1 - (xx + zz)) * sy;
        this.m06 = (yz + wx) * sy;
        this.m07 = 0;
        this.m08 = (xz + wy) * sz;
        this.m09 = (yz - wx) * sz;
        this.m10 = (1 - (xx + yy)) * sz;
        this.m11 = 0;
        this.m12 = pos.x;
        this.m13 = pos.y;
        this.m14 = pos.z;
        this.m15 = 1;

        return this;
    }

    lookAt(position, lookAt, upVector) {
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

        const eyex = position.x;
        const eyey = position.y;
        const eyez = position.z;
        const upx = upVector.x;
        const upy = upVector.y;
        const upz = upVector.z;
        const centerx = lookAt.x;
        const centery = lookAt.y;
        const centerz = lookAt.z;

        if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
            this.setIdentity();
            return this;
        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        this.m00 = x0;
        this.m01 = y0;
        this.m02 = z0;
        this.m03 = 0;
        this.m04 = x1;
        this.m05 = y1;
        this.m06 = z1;
        this.m07 = 0;
        this.m08 = x2;
        this.m09 = y2;
        this.m10 = z2;
        this.m11 = 0;
        this.m12 = -(x0 * eyex + x1 * eyey + x2 * eyez);
        this.m13 = -(y0 * eyex + y1 * eyey + y2 * eyez);
        this.m14 = -(z0 * eyex + z1 * eyey + z2 * eyez);
        this.m15 = 1;

        return this;
    }

    ortho(left, right, bottom, top, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);

        this.m00 = -2 * lr;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = -2 * bt;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m10 = 2 * nf;
        this.m11 = 0;
        this.m12 = (left + right) * lr;
        this.m13 = (top + bottom) * bt;
        this.m14 = (far + near) * nf;
        this.m15 = 1;

        return this;
    }

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        let nf;

        this.m00 = f / aspect;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = f;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m11 = -1;
        this.m12 = 0;
        this.m13 = 0;
        this.m15 = 0;

        if (far != null && far !== Infinity) {
            nf = 1 / (near - far);
            this.m10 = (far + near) * nf;
            this.m14 = (2 * far * near) * nf;
        } else {
            this.m10 = -1;
            this.m14 = -2 * near;
        }

        return this;
    }

    static fromQuaternionTranslationScale(quat, pos, scl) {
        return new Mat4().setFromQuaternionTranslationScale(quat, pos, scl);
    }
}

/* eslint-disable prefer-destructuring */

class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getAsArray() {
        return [this.x, this.y, this.z];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec3) {
        this.x = vec3[0];
        this.y = vec3[1];
        this.z = vec3[2];
        return this;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    multiply(x, y, z) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }

    transformByMat4(mat4) {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        let w = mat4.m03 * x + mat4.m07 * y + mat4.m11 * z + mat4.m15;
        w = w || 1.0;

        this.x = (mat4.m00 * x + mat4.m04 * y + mat4.m08 * z + mat4.m12) / w;
        this.y = (mat4.m01 * x + mat4.m05 * y + mat4.m09 * z + mat4.m13) / w;
        this.z = (mat4.m02 * x + mat4.m06 * y + mat4.m10 * z + mat4.m14) / w;

        return this;
    }
}

/* eslint-disable prefer-destructuring, one-var, one-var-declaration-per-line, max-len, no-mixed-operators */

class Quat {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    getAsArray() {
        return [this.x, this.y, this.z, this.w];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(quat) {
        this.x = quat[0];
        this.y = quat[1];
        this.z = quat[2];
        this.w = quat[3];
        return this;
    }

    clone() {
        return new Quat(this.x, this.y, this.z, this.w);
    }

    setFromEuler(x = 0, y = 0, z = 0) {
        const halfToRad = 0.5 * Math.PI / 180.0;
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;

        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);

        this.x = sx * cy * cz - cx * sy * sz;
        this.y = cx * sy * cz + sx * cy * sz;
        this.z = cx * cy * sz - sx * sy * cz;
        this.w = cx * cy * cz + sx * sy * sz;

        return this;
    }

    multiply(quat) {
        const ax = this.x, ay = this.y, az = this.z, aw = this.w;
        const bx = quat.x, by = quat.y, bz = quat.z, bw = quat.w;

        this.x = ax * bw + aw * bx + ay * bz - az * by;
        this.y = ay * bw + aw * by + az * bx - ax * bz;
        this.z = az * bw + aw * bz + ax * by - ay * bx;
        this.w = aw * bw - ax * bx - ay * by - az * bz;

        return this;
    }

    static fromEuler(x = 0, y = 0, z = 0) {
        return new Quat().setFromEuler(x, y, z);
    }
}

class Transform3D extends Node {
    constructor() {
        super();
        this.position = new Vec3();
        this.quaternion = new Quat();
        this.scaling = new Vec3(1, 1, 1);
        this.modelMatrix = new Mat4();
        this.transformDirty = false;
    }

    translate(x, y, z) {
        this.position.add(x, y, z);
        this.transformDirty = true;
    }

    scale(x, y, z) {
        this.scaling.multiply(x, y, z);
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quat = Quat.fromEuler(x, y, z);
        this.quaternion.multiply(quat);
        this.transformDirty = true;
    }

    computeModelMatrix(combinedTransformationMatrix) {
        const pos = this.position;
        const scl = this.scaling;
        const rot = this.quaternion;

        if (combinedTransformationMatrix) {
            const transformationMatrix = Mat4.fromQuaternionTranslationScale(rot, pos, scl);
            this.modelMatrix = combinedTransformationMatrix.clone().multiply(transformationMatrix);
        } else if (this.transformDirty) {
            this.modelMatrix.setFromQuaternionTranslationScale(rot, pos, scl);
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].computeModelMatrix(this.modelMatrix);
        }

        this.transformDirty = false;
    }
}

// Abstract Class

class Camera extends Transform3D {
    constructor() {
        super();
        this.upVector = new Vec3(0, 1, 0);
        this.viewMatrix = new Mat4();
        this.projectionMatrix = new Mat4();
        this.transform = new Transform3D();
    }

    lookAt(x, y, z) {
        this.viewMatrix.lookAt(this.position, new Vec3(x, y, z), this.upVector);
    }
}

class OrthographicCamera extends Camera {
    constructor(left, right, bottom, top, near, far) {
        super();
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix(left, right, bottom, top, near, far);
    }

    updateProjectionMatrix(left, right, bottom, top, near, far) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.projectionMatrix.ortho(left, right, bottom, top, near, far);
    }
}

class PerspectiveCamera extends Camera {
    constructor(fov, aspect, near, far) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix(fov, aspect, near, far);
    }

    updateProjectionMatrix(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projectionMatrix.perspective(fov, aspect, near, far);
    }
}

class Geometry {
    constructor() {
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.vertexColors = [];

        this.vertexVectorSize = 3;
        this.normalVectorSize = 3;
        this.uvVectorSize = 2;
        this.vertexColorVectorSize = 4;
    }

    getVertices() {
        return this.vertices;
    }

    getVerticesAsFloat32Array() {
        return Float32Array.from(this.vertices);
    }

    setVertices(vertices) {
        this.vertices = vertices;
        return this;
    }

    getNormals() {
        return this.normals;
    }

    getNormalsAsFloat32Array() {
        return Float32Array.from(this.normals);
    }

    setNormals(normals) {
        this.normals = normals;
        return this;
    }

    getUvs() {
        return this.uvs;
    }

    getUvsAsFloat32Array() {
        return Float32Array.from(this.uvs);
    }

    setUvs(uvs) {
        this.uvs = uvs;
        return this;
    }

    getVertexColors() {
        return this.vertexColors;
    }

    getVertexColorsAsFloat32Array() {
        return Float32Array.from(this.vertexColors);
    }

    setVertexColors(vertexColors) {
        this.vertexColors = vertexColors;
        return this;
    }

    getVertexVectorSize() {
        return this.vertexVectorSize;
    }

    setVertexVectorSize(vertexVectorSize) {
        this.vertexVectorSize = vertexVectorSize;
        return this;
    }

    getNormalVectorSize() {
        return this.normalVectorSize;
    }

    setNormalVectorSize(normalVectorSize) {
        this.normalVectorSize = normalVectorSize;
        return this;
    }

    getUvVectorSize() {
        return this.uvVectorSize;
    }

    setUvVectorSize(uvVectorSize) {
        this.uvVectorSize = uvVectorSize;
        return this;
    }

    getVertexColorVectorSize() {
        return this.vertexColorVectorSize;
    }

    setVertexColorVectorSize(vertexColorVectorSize) {
        this.vertexColorVectorSize = vertexColorVectorSize;
        return this;
    }

    clone() {
        const clone = new Geometry();
        clone.setVertices([...this.vertices]);
        clone.setNormals([...this.normals]);
        clone.setUvs([...this.uvs]);
        clone.setVertexColors([...this.vertexColors]);

        clone.vertexVectorSize = this.vertexVectorSize;
        clone.normalVectorSize = this.normalVectorSize;
        clone.uvVectorSize = this.uvVectorSize;
        clone.vertexColorVectorSize = this.vertexColorVectorSize;

        return clone;
    }
}

class Mesh extends Transform3D {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

class DirectionalLight extends Transform3D {
    constructor() {
        super();
        this.direction = new Vec3(0, 0, 0);
        this.color = new Vec3(1, 1, 1);
    }

    getDirection() {
        return this.direction;
    }

    setDirection(x, y, z) {
        this.direction = new Vec3(x, y, z);
        return this;
    }

    getColor() {
        return this.color;
    }

    setColor(r, g, b) {
        this.color = new Vec3(r, g, b);
        return this;
    }
}

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
        const directionalLights = [];

        for (let i = 0; i < flatChildrenList.length; i++) {
            const child = flatChildrenList[i];
            if (child instanceof Camera) cameras.push(child);
            if (child instanceof Mesh) meshes.push(child);
            if (child instanceof DirectionalLight) directionalLights.push(child);
        }

        return {
            activeCamera: this.activeCamera || cameras[0],
            cameras,
            meshes,
            directionalLights,
        };
    }
}

/* eslint-disable prefer-destructuring, one-var, one-var-declaration-per-line */

class Mat3 {
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 1, m05 = 0, m06 = 0, m07 = 0, m08 = 1) {
        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m03 = m03;
        this.m04 = m04;
        this.m05 = m05;
        this.m06 = m06;
        this.m07 = m07;
        this.m08 = m08;
    }

    getAsArray() {
        return [
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
        ];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(mat3) {
        this.m00 = mat3[0];
        this.m01 = mat3[1];
        this.m02 = mat3[2];
        this.m03 = mat3[3];
        this.m04 = mat3[4];
        this.m05 = mat3[5];
        this.m06 = mat3[6];
        this.m07 = mat3[7];
        this.m08 = mat3[8];
        return this;
    }

    clone() {
        return new Mat3(
            this.m00,
            this.m01,
            this.m02,
            this.m03,
            this.m04,
            this.m05,
            this.m06,
            this.m07,
            this.m08,
        );
    }

    multiply(mat3) {
        const a00 = this.m00, a01 = this.m01, a02 = this.m02;
        const a10 = this.m03, a11 = this.m04, a12 = this.m05;
        const a20 = this.m06, a21 = this.m07, a22 = this.m08;

        const b00 = mat3.m00, b01 = mat3.m01, b02 = mat3.m02;
        const b10 = mat3.m03, b11 = mat3.m04, b12 = mat3.m05;
        const b20 = mat3.m06, b21 = mat3.m07, b22 = mat3.m08;

        this.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        this.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        this.m02 = b00 * a02 + b01 * a12 + b02 * a22;

        this.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        this.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        this.m05 = b10 * a02 + b11 * a12 + b12 * a22;

        this.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        this.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        this.m08 = b20 * a02 + b21 * a12 + b22 * a22;

        return this;
    }

    setAsNormalMatrixFromMat4(mat4) {
        const a00 = mat4.m00, a01 = mat4.m01, a02 = mat4.m02, a03 = mat4.m03;
        const a10 = mat4.m04, a11 = mat4.m05, a12 = mat4.m06, a13 = mat4.m07;
        const a20 = mat4.m08, a21 = mat4.m09, a22 = mat4.m10, a23 = mat4.m11;
        const a30 = mat4.m12, a31 = mat4.m13, a32 = mat4.m14, a33 = mat4.m15;

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;
        det = 1.0 / det;

        this.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        this.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        this.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;

        this.m03 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        this.m04 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        this.m05 = (a01 * b08 - a00 * b10 - a03 * b06) * det;

        this.m06 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        this.m07 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        this.m08 = (a30 * b04 - a31 * b02 + a33 * b00) * det;

        return this;
    }

    static normalMatrixFromMat4(mat4) {
        return new Mat3().setAsNormalMatrixFromMat4(mat4);
    }
}

/* eslint-disable prefer-destructuring */

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    getAsArray() {
        return [this.x, this.y];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec2) {
        this.x = vec2[0];
        this.y = vec2[1];
        return this;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    multiply(x, y) {
        this.x *= x;
        this.y *= y;
        return this;
    }
}

class Transform2D extends Node {
    constructor() {
        super();
        this.position = new Vec2();
        this.rotation = 0;
        this.scaling = new Vec2();
        this.modelMatrix = new Mat3();
        this.transformDirty = false;
    }

    translate(x, y) {
        this.position.add(x, y);
        this.transformDirty = true;
    }

    scale(x, y) {
        this.scaling.add(x, y);
        this.transformDirty = true;
    }

    rotate(angle) {
        this.rotation += angle;
        this.transformDirty = true;
    }
}

class Material {
    constructor() {
        this.indices = [];
        this.shaderVersion = '#version 300 es\n\n';
    }

    getIndices() {
        return this.indices;
    }

    getIndicesAsUint32Array() {
        return new Uint32Array(this.indices);
    }

    setIndices(indices) {
        this.indices = indices;
        return this;
    }

    getShaderVersion() {
        return this.shaderVersion;
    }
}

const getUniformsDeclaration = (uniforms) => {
    const keys = Object.keys(uniforms).filter(key => uniforms[key]);
    return keys.map(key => `uniform ${uniforms[key]} ${key};`).join('\n');
};

class VertexColorMaterial extends Material {
    getShaderData({ shaderLayoutLocations }) {
        const uniforms = {
            vertexShader: {
                mvp: 'mat4',
            },
            fragmentShader: {
            },
        };

        const vertexShaderSource = `
            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.vertexColor}) in vec4 vertexColor;

            ${getUniformsDeclaration(uniforms.vertexShader)}

            out vec4 vColor;

            void main() {
                vColor = vertexColor;
                gl_Position = mvp * vec4(position, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;
            precision highp int;

            in vec4 vColor;
            out vec4 fragmentColor;

            void main() {
                fragmentColor = vColor;
            }
        `;

        const vertexShaderSourceCode = `${this.getShaderVersion()}${vertexShaderSource}`;
        const fragmentShaderSourceCode = `${this.getShaderVersion()}${fragmentShaderSource}`;

        return {
            vertexShaderSourceCode,
            fragmentShaderSourceCode,
            uniforms,
        };
    }

    clone() {
        const clone = new VertexColorMaterial();
        clone.setIndices([...this.indices]);
        return clone;
    }
}

const getUniformsDeclaration$1 = (uniforms) => {
    const keys = Object.keys(uniforms).filter(key => uniforms[key]);
    return keys.map(key => `uniform ${uniforms[key]} ${key};`).join('\n');
};

class PhongMaterial extends Material {
    constructor() {
        super();
        this.ambientIntensity = 0.1;
        this.diffuseColor = new Vec3(1, 0, 0, 1);
        this.specularColor = new Vec3(1, 1, 1, 1);
        this.specularExponent = 0.5;
        this.specularShininess = 256.0;
    }

    getDiffuseColor() {
        return this.diffuseColor;
    }

    setDiffuseColor(r, g, b) {
        this.diffuseColor = new Vec3(r, g, b);
        return this;
    }

    getShaderData({ shaderLayoutLocations }) {
        const { diffuseColor, specularColor, specularExponent, specularShininess } = this;

        const uniforms = {
            vertexShader: {
                modelMatrix: 'mat4',
                mvp: 'mat4',
                normalMatrix: 'mat3',
            },
            fragmentShader: {
                ambientIntensity: 'float',
                lightDirection: 'vec3',
                lightColor: 'vec3',
                cameraPosition: 'vec3',
                diffuseColor: diffuseColor ? 'vec3' : undefined,
                specularColor: specularColor ? 'vec3' : undefined,
                specularExponent: specularExponent ? 'float' : undefined,
                specularShininess: specularShininess ? 'float' : undefined,
            },
        };

        const vertexShaderSource = `
            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.normal}) in vec3 normal;
            layout(location = ${shaderLayoutLocations.uv}) in vec2 uv;

            ${getUniformsDeclaration$1(uniforms.vertexShader)}

            out vec3 vPosition;
            out vec3 vNormal;
            out vec2 vUv;

            void main() {
                vNormal = normalMatrix * normal;
                vPosition = vec3(modelMatrix * vec4(position, 1.0));
                vUv = uv;
                gl_Position = mvp * vec4(position, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;
            precision highp int;

            ${getUniformsDeclaration$1(uniforms.fragmentShader)}

            in vec3 vPosition;
            in vec3 vNormal;
            in vec2 vUv;

            out vec4 fragmentColor;

            void main() {
                // ambient
                vec3 ambient = ambientIntensity * lightColor;

                // diffuse
                vec3 norm = normalize(vNormal);
                // vec3 lightDir = normalize(lightPosition - vPosition);
                vec3 lightDir = normalize(lightDirection);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * lightColor;

                //specular
                vec3 viewDir = normalize(cameraPosition - vPosition);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
                vec3 specular = specularExponent * spec * lightColor;

                vec3 result = (ambient + diffuse + specular) * diffuseColor;
                fragmentColor = vec4(result, 1.0);
            }
        `;

        const vertexShaderSourceCode = `${this.getShaderVersion()}${vertexShaderSource}`;
        const fragmentShaderSourceCode = `${this.getShaderVersion()}${fragmentShaderSource}`;

        return {
            vertexShaderSourceCode,
            fragmentShaderSourceCode,
            uniforms,
        };
    }

    clone() {
        const clone = new PhongMaterial();
        clone.setIndices([...this.indices]);
        return clone;
    }
}

/* eslint-disable prefer-destructuring */

class Vec4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    getAsArray() {
        return [this.x, this.y, this.z, this.w];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec4) {
        this.x = vec4[0];
        this.y = vec4[1];
        this.z = vec4[2];
        this.w = vec4[3];
        return this;
    }

    clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }

    add(x, y, z, w) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.w += w;
        return this;
    }

    multiply(x, y, z, w) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        this.w *= w;
        return this;
    }
}

class Viewport {
    constructor(gl, x = 0, y = 0, width = 0, height = 0) {
        if (!gl) throw new Error('missing argument: "gl" in Viewport constructor');
        this.gl = gl;
        this.resize(x, y, width, height);
        this.setClearColor();
    }

    resize(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.gl.viewport(this.x, this.y, this.width, this.height);
    }

    setClearColor(r = 0, g = 0, b = 0, a = 1) {
        this.clearColor = { r, g, b, a };
        this.gl.clearColor(r, g, b, a);
    }
}

/* eslint-disable no-console */

const arrayBufferLookupTable = {
    vertex: (geometry, shaderLoc) => ({
        location: shaderLoc.vertex,
        bufferData: geometry.getVerticesAsFloat32Array(),
        bufferSize: geometry.getVertexVectorSize(),
    }),
    normal: (geometry, shaderLoc) => ({
        location: shaderLoc.normal,
        bufferData: geometry.getNormalsAsFloat32Array(),
        bufferSize: geometry.getNormalVectorSize(),
    }),
    uv: (geometry, shaderLoc) => ({
        location: shaderLoc.uv,
        bufferData: geometry.getUvsAsFloat32Array(),
        bufferSize: geometry.getUvVectorSize(),
    }),
    vertexColor: (geometry, shaderLoc) => ({
        location: shaderLoc.vertexColor,
        bufferData: geometry.getVertexColorsAsFloat32Array(),
        bufferSize: geometry.getVertexColorVectorSize(),
    }),
};

class WebGl2Renderer {
    constructor(domNode) {
        this.domNode = domNode;
        this.canvas = document.createElement('canvas');
        this.domNode.appendChild(this.canvas);
        this.canvas.style.position = 'relative';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.domNode.clientWidth;
        this.canvas.height = this.domNode.clientHeight;
        this.gl = this.canvas.getContext('webgl2');

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.shaderLayoutLocations = {
            vertex: 0,
            normal: 1,
            uv: 2,
            vertexColor: 3,
        };

        this.sceneCache = {};
        this.meshCache = {};
    }

    createShader(type, source) {
        const { gl } = this;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) return shader;
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return undefined;
    }

    createProgram(vertexShader, fragmentShader) {
        const { gl } = this;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) return program;
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return undefined;
    }

    createTexture(image) {
        const { gl } = this;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        return texture;
    }

    createArrayBuffer(type, geometry) {
        const { gl } = this;
        const { location, bufferData, bufferSize } = arrayBufferLookupTable[type](geometry, this.shaderLayoutLocations);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, bufferSize, gl.FLOAT, false, 0, 0);
    }

    createVertexArray(geometry) {
        const { gl } = this;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const hasPositions = geometry.getVertices().length > 0;
        if (hasPositions) this.createArrayBuffer('vertex', geometry);

        const hasNormals = geometry.getNormals().length > 0;
        if (hasNormals) this.createArrayBuffer('normal', geometry);

        const hasUvs = geometry.getUvs().length > 0;
        if (hasUvs) this.createArrayBuffer('uv', geometry);

        const hasColors = geometry.getVertexColors().length > 0;
        if (hasColors) this.createArrayBuffer('vertexColor', geometry);

        return vao;
    }

    createElementArrayBuffer(material) {
        const { gl } = this;
        const buffer = this.gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, material.getIndicesAsUint32Array(), gl.STATIC_DRAW);
        return buffer;
    }

    resize() {
        const { gl, canvas, domNode } = this;
        const w = domNode.clientWidth;
        const h = domNode.clientHeight;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    cacheMesh(mesh) {
        const { gl } = this;

        const materialArgs = {
            shaderLayoutLocations: this.shaderLayoutLocations,
        };

        const shaderData = mesh.material.getShaderData(materialArgs);
        const vertexShader = this.createShader(gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        const shader = this.createProgram(vertexShader, fragmentShader);

        const flatUniforms = { ...shaderData.uniforms.vertexShader, ...shaderData.uniforms.fragmentShader };
        const uniforms = Object.keys(flatUniforms).filter(key => flatUniforms[key]).reduce((accum, key) => {
            accum[key] = gl.getUniformLocation(shader, key);
            return accum;
        }, {});

        const cachedMesh = {
            vao: this.createVertexArray(mesh.geometry),
            indices: this.createElementArrayBuffer(mesh.material),
            shader,
            uniforms,
        };

        this.meshCache[mesh.id] = cachedMesh;
        return cachedMesh;
    }

    render(scene) {
        const { gl } = this;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // eslint-disable-line no-bitwise

        scene.computeModelMatrix();
        const { activeCamera, meshes, directionalLights } = scene.getChildrenRecursive();
        // const lightWorldPosition = directionalLights[0].position.clone().transformByMat4(directionalLights[0].modelMatrix);

        for (let i = 0; i < meshes.length; i++) {
            const currentMesh = meshes[i];
            const cachedMesh = this.meshCache[currentMesh.id] || this.cacheMesh(currentMesh);

            const mv = activeCamera.viewMatrix.clone().multiply(currentMesh.modelMatrix);
            const mvp = activeCamera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);
            const uniformKeys = Object.keys(cachedMesh.uniforms);

            gl.bindVertexArray(cachedMesh.vao);
            gl.useProgram(cachedMesh.shader);

            if (uniformKeys.includes('modelMatrix')) gl.uniformMatrix4fv(cachedMesh.uniforms.modelMatrix, false, currentMesh.modelMatrix.getAsFloat32Array());
            if (uniformKeys.includes('mvp')) gl.uniformMatrix4fv(cachedMesh.uniforms.mvp, false, mvp.getAsFloat32Array());
            if (uniformKeys.includes('normalMatrix')) gl.uniformMatrix3fv(cachedMesh.uniforms.normalMatrix, false, normalMatrix.getAsFloat32Array());
            if (uniformKeys.includes('cameraPosition')) gl.uniform3fv(cachedMesh.uniforms.cameraPosition, activeCamera.position.getAsFloat32Array());
            if (uniformKeys.includes('lightDirection')) gl.uniform3fv(cachedMesh.uniforms.lightDirection, directionalLights[0].direction.getAsFloat32Array());
            if (uniformKeys.includes('lightColor')) gl.uniform3fv(cachedMesh.uniforms.lightColor, directionalLights[0].color.getAsFloat32Array());
            if (uniformKeys.includes('diffuseColor')) gl.uniform3fv(cachedMesh.uniforms.diffuseColor, currentMesh.material.diffuseColor.getAsFloat32Array());
            if (uniformKeys.includes('specularColor')) gl.uniform3fv(cachedMesh.uniforms.specularColor, currentMesh.material.specularColor.getAsFloat32Array());
            if (uniformKeys.includes('specularExponent')) gl.uniform1f(cachedMesh.uniforms.specularExponent, currentMesh.material.specularExponent);
            if (uniformKeys.includes('specularShininess')) gl.uniform1f(cachedMesh.uniforms.specularShininess, currentMesh.material.specularShininess);
            if (uniformKeys.includes('ambientIntensity')) gl.uniform1f(cachedMesh.uniforms.ambientIntensity, currentMesh.material.ambientIntensity);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cachedMesh.indices);
            gl.drawElements(gl.TRIANGLES, currentMesh.material.indices.length, gl.UNSIGNED_INT, 0);
        }
    }
}

export { DirectionalLight, Geometry, Mat3, Mat4, Mesh, Node, OrthographicCamera, PerspectiveCamera, PhongMaterial, Quat, Scene, Transform2D, Transform3D, Vec2, Vec3, Vec4, VertexColorMaterial, Viewport, WebGl2Renderer as WebGL2Renderer };
