'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// https://gist.github.com/jcxplorer/823878

const uuid = () => {
    let uuid = '';
    let i = 0;

    for (i; i < 32; i++) {
        const random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += '-';
        }

        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
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
        let b0  = mat4.m00, b1 = mat4.m01, b2 = mat4.m02, b3 = mat4.m03;
        this.m00 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m01 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m02 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m03 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      
        b0 = mat4.m04; b1 = mat4.m05; b2 = mat4.m06; b3 = mat4.m07;
        this.m04 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m05 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m06 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m07 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      
        b0 = mat4.m08; b1 = mat4.m09; b2 = mat4.m10; b3 = mat4.m11;
        this.m08 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m09 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m10 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m11 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      
        b0 = mat4.m12; b1 = mat4.m13; b2 = mat4.m14; b3 = mat4.m15;
        this.m12 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this.m13 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this.m14 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this.m15 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        return this;
    }

    setFromQuaternionTranslationScale(quat, pos, scl) {
        let x = quat.x, y = quat.y, z = quat.z, w = quat.w;
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
      
        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let sx = scl.x;
        let sy = scl.y;
        let sz = scl.z;
      
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
      
        if (Math.abs(eyex - centerx) < EPSILON &&
            Math.abs(eyey - centery) < EPSILON &&
            Math.abs(eyez - centerz) < EPSILON) {
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
}

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
}

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
        this.scaling.add(x, y, z);
        this.transformDirty = true;
    }

    rotate(x, y, z) {
        const quat = new Quat().setFromEuler(x, y, z);        
        this.quaternion.multiply(quat);
        this.transformDirty = true;
    }

    computeModelMatrix() {
        if (this.transformDirty) {
            this.modelMatrix.setFromQuaternionTranslationScale(this.quaternion, this.position, this.scaling);
            this.transformDirty = false;
        }

        return this.modelMatrix;
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
}

class Mesh extends Transform3D {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

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
}

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

class VertexColorMaterial extends Material {
    constructor() {
        super();
    }

    getVertexShaderSourceCode({ shaderLayoutLocations }) {
        const vertexShaderSourceCode = `
            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.vertexColor}) in vec4 vertexColor;

            uniform mat4 mvp;

            out vec4 vColor;

            void main() {
                vColor = vertexColor;
                gl_Position = mvp * vec4(position, 1.0);
            }
        `;

        return `${this.getShaderVersion()}${vertexShaderSourceCode}`;
    }

    getFragmentShaderSourceCode() {
        const fragmentShaderSourceCode = `
            precision highp float;
            precision highp int;

            in vec4 vColor;
            out vec4 fragmentColor;

            void main() {
                fragmentColor = vColor;
            }
        `;

        return `${this.getShaderVersion()}${fragmentShaderSourceCode}`;
    }
}

class Vec4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
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
        this.shaderLayoutLocations = {
            vertex: 0,
            normal: 1,
            uv: 2,
            vertexColor: 3,
        };
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) return shader;
        console.error(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return undefined;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (success) return program;
        console.error(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
        return undefined;
    }

    createTexture(image) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = this.gl.RGBA;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;

        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        return texture;
    }

    createArrayBuffer(type, geometry) {
        const { location, bufferData, bufferSize } = arrayBufferLookupTable[type](geometry, this.shaderLayoutLocations);        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, bufferSize, this.gl.FLOAT, false, 0, 0);
    }

    createVertexArray(geometry) {
        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);

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
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, material.getIndicesAsUint32Array(), this.gl.STATIC_DRAW);
        return buffer;
    }

    resize() {
        const w = this.domNode.clientWidth;
        const h = this.domNode.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    // TODO cache scene
    render(scene) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        const { activeCamera, meshes } = scene.getChildrenRecursive();

        for (let i = 0; i < meshes.length; i++) {
            meshes[i].computeModelMatrix(); // TODO: parent-child relationship
            const { geometry, material, modelMatrix } = meshes[i];

            const materialArgs = {
                shaderLayoutLocations: this.shaderLayoutLocations,
            };

            const vertexShader = this.createShader(this.gl.VERTEX_SHADER, material.getVertexShaderSourceCode(materialArgs));
            const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, material.getFragmentShaderSourceCode(materialArgs));
            const shader = this.createProgram(vertexShader, fragmentShader);

            const mv = activeCamera.viewMatrix.clone().multiply(modelMatrix);
            const mvp = activeCamera.projectionMatrix.clone().multiply(mv);
            

            const renderable = {
                vao: this.createVertexArray(geometry),
                indices: this.createElementArrayBuffer(material),
                shader,
                mvpShaderUniformLocation: this.gl.getUniformLocation(shader, 'mvp'),
            };

            this.gl.bindVertexArray(renderable.vao);
            this.gl.useProgram(renderable.shader);
            this.gl.uniformMatrix4fv(renderable.mvpShaderUniformLocation, false, mvp.getAsFloat32Array());
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, renderable.indices);
            this.gl.drawElements(this.gl.TRIANGLES, material.indices.length, this.gl.UNSIGNED_INT, 0);
            
        }
        
    }
}

exports.Geometry = Geometry;
exports.Mat3 = Mat3;
exports.Mat4 = Mat4;
exports.Mesh = Mesh;
exports.Node = Node;
exports.OrthographicCamera = OrthographicCamera;
exports.PerspectiveCamera = PerspectiveCamera;
exports.Quat = Quat;
exports.Scene = Scene;
exports.Transform2D = Transform2D;
exports.Transform3D = Transform3D;
exports.Vec2 = Vec2;
exports.Vec3 = Vec3;
exports.Vec4 = Vec4;
exports.VertexColorMaterial = VertexColorMaterial;
exports.Viewport = Viewport;
exports.WebGL2Renderer = WebGl2Renderer;
