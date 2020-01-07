'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

class Component {
    constructor(entityId) {
        this.id = uuid();
        this.entityId = entityId || null;
    }

    getEntityId() {
        return this.entityId;
    }

    setEntityId(newEntityId) {
        this.entityId = newEntityId;
    }
}

/* eslint-disable prefer-destructuring */

class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.cache = [x, y, z];
    }

    getAsArray() {
        // return [this.x, this.y, this.z];
        return this.cache;
    }

    // getAsFloat32Array() {
    //     return Float32Array.from(this.getAsArray());
    // }

    setFromArray(vec3) {
        this.x = vec3[0];
        this.y = vec3[1];
        this.z = vec3[2];
        this.cache = [vec3[0], vec3[1], vec3[2]];
        return this;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.cache = [this.x, this.y, this.z];
        return this;
    }

    multiply(x, y, z) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        this.cache = [this.x, this.y, this.z];
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

class DirectionalLight extends Component {
    constructor(direction, ambientColor, diffuseColor, specularColor) {
        super();
        this.direction = direction || new Vec3(0, 0, 0);
        this.ambientColor = ambientColor || new Vec3(1, 1, 1);
        this.diffuseColor = diffuseColor || new Vec3(1, 1, 1);
        this.specularColor = specularColor || new Vec3(1, 1, 1);
    }

    getDirection() {
        return this.direction;
    }

    setDirection(x, y, z) {
        this.direction = new Vec3(x, y, z);
        return this;
    }

    getAmbientColor() {
        return this.ambientColor;
    }

    setAmbientColor(r, g, b) {
        this.ambientColor = new Vec3(r, g, b);
        return this;
    }

    getDiffuseColor() {
        return this.diffuseColor;
    }

    setDiffuseColor(r, g, b) {
        this.diffuseColor = new Vec3(r, g, b);
        return this;
    }

    getSpecularColor() {
        return this.specularColor;
    }

    setSpecularColor(r, g, b) {
        this.specularColor = new Vec3(r, g, b);
        return this;
    }
}

class Geometry extends Component {
    constructor(vertices, normals, uvs, vertexColors) {
        super();
        this.vertices = vertices || [];
        this.normals = normals || [];
        this.uvs = uvs || [];
        this.vertexColors = vertexColors || [];

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

class AbstractCamera extends Component {
    constructor() {
        super();
        this.upVector = new Vec3(0, 1, 0);
        this.viewMatrix = new Mat4();
        this.projectionMatrix = new Mat4();
    }

    lookAt(position, center) {
        this.viewMatrix.lookAt(position, center, this.upVector);
        return this;
    }
}

class OrthographicCamera extends AbstractCamera {
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

class PerspectiveCamera extends AbstractCamera {
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

class AbstractMaterial extends Component {
    constructor(indices) {
        super();
        this.indices = indices || [];
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
}

class StandardMaterial extends AbstractMaterial {
    constructor(indices, diffuseColor, specularColor, ambientIntensity, specularExponent, specularShininess) {
        super(indices);
        this.diffuseColor = diffuseColor || new Vec3(1, 0, 0);
        this.specularColor = specularColor || new Vec3(1, 1, 1);
        this.ambientIntensity = ambientIntensity || 0.1;
        this.specularExponent = specularExponent || 0.5;
        this.specularShininess = specularShininess || 256;
    }

    getAmbientIntensity() {
        return this.ambientIntensity;
    }

    setAmbientIntensity(ambientIntensity) {
        this.ambientIntensity = ambientIntensity;
        return this;
    }

    getDiffuseColor() {
        return this.diffuseColor;
    }

    setDiffuseColor(r, g, b) {
        this.diffuseColor = new Vec3(r, g, b);
        return this;
    }

    getSpecularColor() {
        return this.specularColor;
    }

    setSpecularColor(r, g, b) {
        this.specularColor = new Vec3(r, g, b);
        return this;
    }

    getSpecularExponent() {
        return this.specularExponent;
    }

    setSpecularExponent(specularExponent) {
        this.specularExponent = specularExponent;
        return this;
    }

    getSpecularShininess() {
        return this.specularShininess;
    }

    setSpecularShininess(specularShininess) {
        this.specularShininess = specularShininess;
        return this;
    }

    clone() {
        const clone = new StandardMaterial();
        clone.setIndices([...this.indices]);
        clone.ambientIntensity = this.ambientIntensity;
        clone.diffuseColor = this.diffuseColor.clone();
        clone.specularColor = this.specularColor.clone();
        clone.specularExponent = this.specularExponent;
        clone.specularShininess = this.specularShininess;
        return clone;
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

class Transform3D extends Component {
    constructor(position, quaternion, scaling) {
        super();
        this.position = position || new Vec3();
        this.quaternion = quaternion || new Quat();
        this.scaling = scaling || new Vec3(1, 1, 1);
        this.modelMatrix = new Mat4();
        this.transformDirty = position || quaternion || scaling;
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

    computeModelMatrix() {
        if (this.transformDirty) {
            this.modelMatrix.setFromQuaternionTranslationScale(this.quaternion, this.position, this.scaling);
            this.transformDirty = false;
        }
    }
}

class Entity {
    constructor(world) {
        this.id = uuid();
        this.world = world;
    }

    getComponents() {
        return this.world.componentsByEntityId[this.id];
    }
}

class World {
    constructor() {
        this.entities = [];
        this.components = [];
        this.systems = [];
        this.subscribers = [];

        this.componentsByType = {
            MATERIAL: [],
            TRANSFORM3D: [],
            GEOMETRY: [],
            CAMERA: [],
            DIRECTIONAL_LIGHT: [],
        };

        this.componentsByEntityId = {};
    }

    on(event, fn) {
        this.subscribers.push({ event, fn });
    }

    emit(event, ...args) {
        for (let i = 0; i < this.subscribers.length; i++) {
            const subscriber = this.subscribers[i];
            if (subscriber.event === event) subscriber.fn(...args);
        }
    }

    createEntity(components) {
        const entity = new Entity(this);
        this.entities.push(entity);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];

            if (component instanceof Component) {
                component.setEntityId(entity.id);
                this.components.push(component);

                // duplicate data for faster access by entityId
                if (!this.componentsByEntityId[entity.id]) this.componentsByEntityId[entity.id] = [];
                this.componentsByEntityId[entity.id].push(component);

                // duplicate data for faster access by type
                if (component instanceof AbstractMaterial) this.componentsByType.MATERIAL.push(component);
                if (component instanceof Geometry) this.componentsByType.GEOMETRY.push(component);
                if (component instanceof Transform3D) this.componentsByType.TRANSFORM3D.push(component);
                if (component instanceof AbstractCamera) this.componentsByType.CAMERA.push(component);
                if (component instanceof DirectionalLight) this.componentsByType.DIRECTIONAL_LIGHT.push(component);
            } else {
                // eslint-disable-next-line no-console
                console.error('createEntity constructor only accepts instances of class: "Component"', { component, entity });
            }
        }

        return entity;
    }

    addSystem(system) {
        this.systems.push(system);
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

    // Uniform Buffers needs mat3 as mat4
    // for whatever fucking reason
    // it took 3 days to figure this out
    getAsMat4Array() {
        return [
            this.m00,
            this.m01,
            this.m02,
            0,
            this.m03,
            this.m04,
            this.m05,
            0,
            this.m06,
            this.m07,
            this.m08,
            0,
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

/* eslint-disable max-len */

const ShaderBuilder = {
    StandardMaterial: {
        buildShaderWithUniforms(shaderLayoutLocations, uniformTypes) {
            const vertexShaderSource = `
                #version 300 es
    
                precision highp float;
                precision highp int;
    
                layout(location = ${shaderLayoutLocations.VERTEX}) in vec3 position;
                layout(location = ${shaderLayoutLocations.NORMAL}) in vec3 normal;
                layout(location = ${shaderLayoutLocations.UV}) in vec2 uv;
    
                uniform ${uniformTypes.MAT4} modelMatrix;
                uniform ${uniformTypes.MAT4} mvp;
                uniform ${uniformTypes.MAT3} normalMatrix;
    
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
                #version 300 es
    
                precision highp float;
                precision highp int;

                const int MAX_DIRECTIONAL_LIGHTS = 5;
    
                in vec3 vPosition;
                in vec3 vNormal;
                in vec2 vUv;

                uniform ${uniformTypes.VEC3} diffuseColor;
                uniform ${uniformTypes.VEC3} specularColor;
                uniform ${uniformTypes.FLOAT} ambientIntensity;
                uniform ${uniformTypes.FLOAT} specularExponent;
                uniform ${uniformTypes.FLOAT} specularShininess;

                uniform ${uniformTypes.VEC3} cameraPosition;
                uniform ${uniformTypes.VEC3} dirLightDirection[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.VEC3} dirLightAmbientColor[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.VEC3} dirLightDiffuseColor[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.VEC3} dirLightSpecularColor[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.INT} numDirLights;
    
                out vec4 fragmentColor;
    
                vec3 CalcDirLight(vec3 dirLightDirection, vec3 dirLightAmbientColor, vec3 dirLightDiffuseColor, vec3 dirLightSpecularColor, vec3 normal, vec3 viewDir)
                {
                    vec3 lightDir = normalize(dirLightDirection);
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
                    vec3 ambient  = (dirLightAmbientColor * diffuseColor) * ambientIntensity;
                    vec3 diffuse  = dirLightDiffuseColor * diff * diffuseColor;
                    vec3 specular = dirLightSpecularColor * spec * specularColor;
                    return ambient + diffuse + specular;
                }
    
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 result = vec3(0.0, 0.0, 0.0);
    
                    for(int i = 0; i < numDirLights; i++) {
                        result += CalcDirLight(dirLightDirection[i], dirLightAmbientColor[i], dirLightDiffuseColor[i], dirLightSpecularColor[i], normal, viewDir);
                    }
    
                    fragmentColor = vec4(result, 1.0);
                }
            `;

            return {
                vertexShaderSourceCode: vertexShaderSource.trim(),
                fragmentShaderSourceCode: fragmentShaderSource.trim(),
            };
        },
        buildShaderWithUniformBuffers(shaderLayoutLocations) {
            const vertexShaderSource = `
                #version 300 es

                precision highp float;
                precision highp int;

                layout(location = ${shaderLayoutLocations.VERTEX}) in vec3 position;
                layout(location = ${shaderLayoutLocations.NORMAL}) in vec3 normal;
                layout(location = ${shaderLayoutLocations.UV}) in vec2 uv;

                layout(std140, column_major) uniform;

                struct Matrices {
                    mat4 modelMatrix;
                    mat4 mvp;
                    mat3 normalMatrix;
                };

                uniform MatricesUniform {
                    Matrices matrices;
                };

                out vec3 vPosition;
                out vec3 vNormal;
                out vec2 vUv;

                void main() {
                    vNormal = matrices.normalMatrix * normal;
                    vPosition = vec3(matrices.modelMatrix * vec4(position, 1.0));
                    vUv = uv;
                    gl_Position = matrices.mvp * vec4(position, 1.0);
                }
            `;

            const fragmentShaderSource = `
                #version 300 es

                precision highp float;
                precision highp int;

                const int MAX_DIRECTIONAL_LIGHTS = 5;

                layout(std140, column_major) uniform;

                struct DirectionalLight {
                    vec3 direction;
                    vec3 ambientColor;
                    vec3 diffuseColor;
                    vec3 specularColor;
                };

                struct StandardMaterial {
                    vec3 diffuseColor;
                    vec3 specularColor;
                    float ambientIntensity;
                    float specularExponent;
                    float specularShininess;
                };

                uniform SceneUniform {
                    DirectionalLight directionalLights[MAX_DIRECTIONAL_LIGHTS];
                    int numDirectionalLights;
                    vec3 cameraPosition;
                };

                uniform MaterialUniform {
                    StandardMaterial material;
                };

                in vec3 vPosition;
                in vec3 vNormal;
                in vec2 vUv;
                out vec4 fragmentColor;

                vec3 CalcDirLight(DirectionalLight light, vec3 normal, vec3 viewDir)
                {
                    vec3 lightDir = normalize(light.direction);
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.specularShininess);
                    vec3 ambient  = (light.ambientColor * material.diffuseColor) * material.ambientIntensity;
                    vec3 diffuse  = light.diffuseColor * diff * material.diffuseColor;
                    vec3 specular = light.specularColor * spec * material.specularColor;
                    return ambient + diffuse + specular;
                }

                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 result = vec3(0.0, 0.0, 0.0);
                    for(int i = 0; i < numDirectionalLights; i++) {
                        result += CalcDirLight(directionalLights[i], normal, viewDir);
                    }
                    fragmentColor = vec4(result, 1.0);
                }
            `;

            return {
                vertexShaderSourceCode: vertexShaderSource.trim(),
                fragmentShaderSourceCode: fragmentShaderSource.trim(),
            };
        },
    },
};

/* eslint-disable no-console, no-bitwise */

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

const getViewNameForUniformName = (uniformName) => {
    if (uniformName.includes('[')) return uniformName;
    if (uniformName.includes('.')) return uniformName.split('.')[1];
    return uniformName;
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

    createUBO(shader, blockBinding, uniformBlockName, uniformNames, uniformValues) {
        const { gl } = this;

        const blockIndex = gl.getUniformBlockIndex(shader, uniformBlockName);
        const blockSize = gl.getActiveUniformBlockParameter(shader, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
        const arrayBuffer = new ArrayBuffer(blockSize);

        const uniformIndices = gl.getUniformIndices(shader, uniformNames);
        const uniformOffsets = gl.getActiveUniforms(shader, uniformIndices, gl.UNIFORM_OFFSET);

        // TODO: add support for different data types
        const views = uniformNames
            .map(getViewNameForUniformName)
            .reduce((accum, name, idx) => {
                accum[name] = name === 'numDirectionalLights' ? new Int32Array(arrayBuffer, uniformOffsets[idx]) : new Float32Array(arrayBuffer, uniformOffsets[idx]);
                accum[name].set(uniformValues[idx]);
                return accum;
            }, {});

        console.log({ uniformNames, arrayBuffer, uniformIndices, uniformOffsets, views });

        const webglBuffer = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, webglBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, arrayBuffer, gl.DYNAMIC_DRAW);
        gl.uniformBlockBinding(shader, blockIndex, blockBinding);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, blockBinding, webglBuffer);

        return {
            webglBuffer,
            arrayBuffer,
            blockBinding,
            views,
        };
    }

    resize() {
        const { gl, canvas, domNode } = this;
        const w = domNode.clientWidth;
        const h = domNode.clientHeight;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    cacheMesh(mesh, { activeCamera, directionalLights }) {
        const { gl, shaderLayoutLocations } = this;

        const { vertexShaderSourceCode, fragmentShaderSourceCode } = ShaderBuilder.buildShaderForStandardMaterial(shaderLayoutLocations);
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSourceCode);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSourceCode);
        const shader = this.createProgram(vertexShader, fragmentShader);

        const mv = activeCamera.viewMatrix.clone().multiply(mesh.modelMatrix);
        const mvp = activeCamera.projectionMatrix.clone().multiply(mv);
        const normalMatrix = Mat3.normalMatrixFromMat4(mv);

        const MatricesUniformUBO = this.createUBO(shader, 3, 'MatricesUniform', [
            'matrices.modelMatrix',
            'matrices.mvp',
            'matrices.normalMatrix',
        ],
        [
            mesh.modelMatrix.getAsArray(),
            mvp.getAsArray(),
            normalMatrix.getAsMat4Array(),
        ]);

        // ===============================

        const MaterialUniformUBO = this.createUBO(shader, 2, 'MaterialUniform', [
            'material.diffuseColor',
            'material.specularColor',
            'material.ambientIntensity',
            'material.specularExponent',
            'material.specularShininess',
        ],
        [
            mesh.material.diffuseColor.getAsArray(),
            mesh.material.specularColor.getAsArray(),
            [mesh.material.ambientIntensity],
            [mesh.material.specularExponent],
            [mesh.material.specularShininess],
        ]);

        // ==================================

        const dirLightNames = directionalLights.flatMap((_, idx) => [
            `directionalLights[${idx}].direction`,
            `directionalLights[${idx}].ambientColor`,
            `directionalLights[${idx}].diffuseColor`,
            `directionalLights[${idx}].specularColor`,
        ]);

        const dirLightValues = directionalLights.flatMap((dirLight) => [
            dirLight.direction.getAsArray(),
            dirLight.ambientColor.getAsArray(),
            dirLight.diffuseColor.getAsArray(),
            dirLight.specularColor.getAsArray(),
        ]);

        const SceneUniformUBO = this.createUBO(shader, 1, 'SceneUniform', [
            ...dirLightNames,
            'numDirectionalLights',
            'cameraPosition',
        ], [
            ...dirLightValues,
            [directionalLights.length],
            activeCamera.position.getAsArray(),
        ]);

        const cachedMesh = {
            vao: this.createVertexArray(mesh.geometry),
            indices: this.createElementArrayBuffer(mesh.material),
            shader,
            ubos: {
                MatricesUniformUBO,
                SceneUniformUBO,
                MaterialUniformUBO,
            },
        };

        this.meshCache[mesh.id] = cachedMesh;
        return cachedMesh;
    }

    render(scene) {
        const { gl } = this;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        scene.computeModelMatrix();
        const { activeCamera, meshes, directionalLights } = scene.getChildrenRecursive();

        for (let i = 0; i < meshes.length; i++) {
            const currentMesh = meshes[i];
            const cachedMesh = this.meshCache[currentMesh.id] || this.cacheMesh(currentMesh, { activeCamera, directionalLights });

            gl.bindVertexArray(cachedMesh.vao);
            gl.useProgram(cachedMesh.shader);

            const { MatricesUniformUBO, MaterialUniformUBO, SceneUniformUBO } = cachedMesh.ubos;

            const mv = activeCamera.viewMatrix.clone().multiply(currentMesh.modelMatrix);
            const mvp = activeCamera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);
            MatricesUniformUBO.views.modelMatrix.set(currentMesh.modelMatrix.getAsArray());
            MatricesUniformUBO.views.mvp.set(mvp.getAsArray());
            MatricesUniformUBO.views.normalMatrix.set(normalMatrix.getAsMat4Array());

            gl.bindBuffer(gl.UNIFORM_BUFFER, MatricesUniformUBO.webglBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, MatricesUniformUBO.arrayBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, MatricesUniformUBO.blockBinding, MatricesUniformUBO.webglBuffer);

            // =============================

            MaterialUniformUBO.views.diffuseColor.set(currentMesh.material.diffuseColor.getAsArray());

            gl.bindBuffer(gl.UNIFORM_BUFFER, MaterialUniformUBO.webglBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, MaterialUniformUBO.arrayBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, MaterialUniformUBO.blockBinding, MaterialUniformUBO.webglBuffer);

            // =============================

            SceneUniformUBO.views['directionalLights[0].direction'].set(directionalLights[0].direction.getAsArray());

            gl.bindBuffer(gl.UNIFORM_BUFFER, SceneUniformUBO.webglBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, SceneUniformUBO.arrayBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, SceneUniformUBO.blockBinding, SceneUniformUBO.webglBuffer);

            // =============================

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cachedMesh.indices);
            gl.drawElements(gl.TRIANGLES, currentMesh.material.indices.length, gl.UNSIGNED_INT, 0);
        }
    }
}

const UNIFORM_TYPES = {
    MAT4: 'mat4',
    MAT3: 'mat3',
    VEC3: 'vec3',
    FLOAT: 'float',
    INT: 'int',
};

const uniformTypeToGlFunction = {
    [UNIFORM_TYPES.MAT4]: (gl, location, value) => gl.uniformMatrix4fv(location, false, value),
    [UNIFORM_TYPES.MAT3]: (gl, location, value) => gl.uniformMatrix3fv(location, false, value),
    [UNIFORM_TYPES.VEC3]: (gl, location, value) => gl.uniform3fv(location, value),
    [UNIFORM_TYPES.FLOAT]: (gl, location, value) => gl.uniform1f(location, value),
    [UNIFORM_TYPES.INT]: (gl, location, value) => gl.uniform1i(location, value),
};

class Uniform {
    constructor(gl, location, name, type) {
        const webglUniformTypeToUniformType = {
            [gl.FLOAT_MAT4]: Uniform.TYPES.MAT4,
            [gl.FLOAT_MAT3]: Uniform.TYPES.MAT3,
            [gl.FLOAT_VEC3]: Uniform.TYPES.VEC3,
            [gl.FLOAT]: Uniform.TYPES.FLOAT,
            [gl.INT]: Uniform.TYPES.INT,
        };

        this.gl = gl;
        this.location = location;
        this.name = name;
        this.type = webglUniformTypeToUniformType[type];
        this.value = null;
    }

    static get TYPES() {
        return UNIFORM_TYPES;
    }

    update(newValue) {
        if (newValue === this.value) return;
        this.value = newValue;
        uniformTypeToGlFunction[this.type](this.gl, this.location, this.value);
    }
}

/* eslint-disable no-console, no-bitwise, prefer-destructuring */

const arrayBufferLookupTable$1 = {
    vertex: (geometry, shaderLoc) => ({
        location: shaderLoc.VERTEX,
        bufferData: geometry.getVerticesAsFloat32Array(),
        bufferSize: geometry.getVertexVectorSize(),
    }),
    normal: (geometry, shaderLoc) => ({
        location: shaderLoc.NORMAL,
        bufferData: geometry.getNormalsAsFloat32Array(),
        bufferSize: geometry.getNormalVectorSize(),
    }),
    uv: (geometry, shaderLoc) => ({
        location: shaderLoc.UV,
        bufferData: geometry.getUvsAsFloat32Array(),
        bufferSize: geometry.getUvVectorSize(),
    }),
    vertexColor: (geometry, shaderLoc) => ({
        location: shaderLoc.VERTEX_COLOR,
        bufferData: geometry.getVertexColorsAsFloat32Array(),
        bufferSize: geometry.getVertexColorVectorSize(),
    }),
};

const getViewNameForUniformName$1 = (uniformName) => {
    if (uniformName.includes('[')) return uniformName;
    if (uniformName.includes('.')) return uniformName.split('.')[1];
    return uniformName;
};

const setCanvasStyle = (canvas) => {
    canvas.style.position = 'relative';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
};

const getRenderables = (componentsByType, componentsByEntityId) => componentsByType.MATERIAL.map(m => ({
    id: m.getEntityId(),
    material: m,
    geometry: componentsByEntityId[m.getEntityId()].find(c => c instanceof Geometry),
    transform: componentsByEntityId[m.getEntityId()].find(c => c instanceof Transform3D),
}));

const getActiveCamera = (componentsByType, componentsByEntityId) => {
    const camera = componentsByType.CAMERA[0];
    return {
        camera,
        transform: componentsByEntityId[camera.getEntityId()].find(c => c instanceof Transform3D),
    };
};

const getDirectionalLights = (componentsByType) => componentsByType.DIRECTIONAL_LIGHT;

const getLightValuesAsFlatArray = (lights, propertyName) => lights.flatMap(l => l[propertyName].getAsArray());

class TestRenderer {
    constructor(domNode, options = {}) {
        this.domNode = domNode;
        this.canvas = document.createElement('canvas');
        this.domNode.appendChild(this.canvas);
        this.canvas.width = this.domNode.clientWidth;
        this.canvas.height = this.domNode.clientHeight;
        setCanvasStyle(this.canvas);

        this.options = {
            useUniformBuffers: options.useUniformBuffers,
        };

        this.gl = this.canvas.getContext('webgl2');
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);

        this.renderableCache = {};
    }

    static get SHADER_LAYOUT_LOCATIONS() {
        return {
            VERTEX: 0,
            NORMAL: 1,
            UV: 2,
            VERTEX_COLOR: 3,
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
        const result = arrayBufferLookupTable$1[type](geometry, TestRenderer.SHADER_LAYOUT_LOCATIONS);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, result.bufferData, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(result.location);
        this.gl.vertexAttribPointer(result.location, result.bufferSize, this.gl.FLOAT, false, 0, 0);
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

    createUBO(shader, blockBinding, uniformBlockName, uniformNames, uniformValues) {
        const blockIndex = this.gl.getUniformBlockIndex(shader, uniformBlockName);
        const blockSize = this.gl.getActiveUniformBlockParameter(shader, blockIndex, this.gl.UNIFORM_BLOCK_DATA_SIZE);
        const arrayBuffer = new ArrayBuffer(blockSize);

        const uniformIndices = this.gl.getUniformIndices(shader, uniformNames);
        const uniformOffsets = this.gl.getActiveUniforms(shader, uniformIndices, this.gl.UNIFORM_OFFSET);

        // TODO: add support for different data types
        const views = uniformNames
            .map(getViewNameForUniformName$1)
            .reduce((accum, name, idx) => {
                accum[name] = name === 'numDirectionalLights'
                    ? new Int32Array(arrayBuffer, uniformOffsets[idx])
                    : new Float32Array(arrayBuffer, uniformOffsets[idx]);

                accum[name].set(uniformValues[idx]);
                return accum;
            }, {});

        // console.log({ uniformNames, arrayBuffer, uniformIndices, uniformOffsets, views });

        const webglBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, webglBuffer);
        this.gl.bufferData(this.gl.UNIFORM_BUFFER, arrayBuffer, this.gl.DYNAMIC_DRAW);
        this.gl.uniformBlockBinding(shader, blockIndex, blockBinding);
        this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, blockBinding, webglBuffer);

        return {
            webglBuffer,
            arrayBuffer,
            blockBinding,
            views,
        };
    }

    resize() {
        const w = this.domNode.clientWidth;
        const h = this.domNode.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    cacheRenderable(renderable, activeCamera, directionalLights) {
        const gl = this.gl;
        const materialClassName = renderable.material.constructor.name;

        const shaderData = this.options.useUniformBuffers
            ? ShaderBuilder[materialClassName].buildShaderWithUniformBuffers(TestRenderer.SHADER_LAYOUT_LOCATIONS, Uniform.TYPES)
            : ShaderBuilder[materialClassName].buildShaderWithUniforms(TestRenderer.SHADER_LAYOUT_LOCATIONS, Uniform.TYPES);

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, shaderData.vertexShaderSourceCode);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, shaderData.fragmentShaderSourceCode);
        const shader = this.createProgram(vertexShader, fragmentShader);
        console.log('cache called');

        const activeUniformsCount = this.gl.getProgramParameter(shader, this.gl.ACTIVE_UNIFORMS);
        const uniforms = [];

        for (let u = 0; u < activeUniformsCount; u++) {
            const uniformInfo = this.gl.getActiveUniform(shader, u);
            const uniformLocation = gl.getUniformLocation(shader, uniformInfo.name);
            uniforms.push(new Uniform(gl, uniformLocation, uniformInfo.name, uniformInfo.type));
        }

        // const mv = activeCamera.camera.viewMatrix.clone().multiply(renderable.transform.modelMatrix);
        // const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
        // const normalMatrix = Mat3.normalMatrixFromMat4(mv);

        // const MatricesUniformUBO = this.createUBO(shader, 3, 'MatricesUniform', [
        //     'matrices.modelMatrix',
        //     'matrices.mvp',
        //     'matrices.normalMatrix',
        // ],
        // [
        //     renderable.transform.modelMatrix.getAsArray(),
        //     mvp.getAsArray(),
        //     normalMatrix.getAsMat4Array(),
        // ]);

        // // ===============================

        // const MaterialUniformUBO = this.createUBO(shader, 2, 'MaterialUniform', [
        //     'material.diffuseColor',
        //     'material.specularColor',
        //     'material.ambientIntensity',
        //     'material.specularExponent',
        //     'material.specularShininess',
        // ],
        // [
        //     renderable.material.diffuseColor.getAsArray(),
        //     renderable.material.specularColor.getAsArray(),
        //     [renderable.material.ambientIntensity],
        //     [renderable.material.specularExponent],
        //     [renderable.material.specularShininess],
        // ]);

        // // ==================================

        // const dirLightNames = directionalLights.flatMap((_, idx) => [
        //     `directionalLights[${idx}].direction`,
        //     `directionalLights[${idx}].ambientColor`,
        //     `directionalLights[${idx}].diffuseColor`,
        //     `directionalLights[${idx}].specularColor`,
        // ]);

        // const dirLightValues = directionalLights.flatMap((dirLight) => [
        //     dirLight.direction.getAsArray(),
        //     dirLight.ambientColor.getAsArray(),
        //     dirLight.diffuseColor.getAsArray(),
        //     dirLight.specularColor.getAsArray(),
        // ]);

        // const SceneUniformUBO = this.createUBO(shader, 1, 'SceneUniform', [
        //     ...dirLightNames,
        //     'numDirectionalLights',
        //     'cameraPosition',
        // ], [
        //     ...dirLightValues,
        //     [directionalLights.length],
        //     activeCamera.transform.position.getAsArray(),
        // ]);

        const cachedRenderable = {
            vao: this.createVertexArray(renderable.geometry),
            indices: this.createElementArrayBuffer(renderable.material),
            shader,
            uniforms,
            // ubos: {
            //     MatricesUniformUBO,
            //     SceneUniformUBO,
            //     MaterialUniformUBO,
            // },
        };

        this.renderableCache[renderable.id] = cachedRenderable;
        return cachedRenderable;
    }

    render(world) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const renderables = getRenderables(world.componentsByType, world.componentsByEntityId);
        const activeCamera = getActiveCamera(world.componentsByType, world.componentsByEntityId);
        const directionalLights = getDirectionalLights(world.componentsByType);

        for (let i = 0; i < renderables.length; i++) {
            const renderable = renderables[i];
            const cachedRenderable = this.renderableCache[renderable.id] || this.cacheRenderable(renderable, activeCamera, directionalLights);

            this.gl.bindVertexArray(cachedRenderable.vao);
            this.gl.useProgram(cachedRenderable.shader);

            // const ubos = cachedRenderable.ubos;

            const mv = activeCamera.camera.viewMatrix.clone().multiply(renderable.transform.modelMatrix);
            const mvp = activeCamera.camera.projectionMatrix.clone().multiply(mv);
            const normalMatrix = Mat3.normalMatrixFromMat4(mv);

            const uniformValueLookupTable = {
                modelMatrix: renderable.transform.modelMatrix.getAsArray(),
                normalMatrix: normalMatrix.getAsArray(),
                mv: mv.getAsArray(),
                mvp: mvp.getAsArray(),
                diffuseColor: renderable.material.diffuseColor.getAsArray(),
                specularColor: renderable.material.specularColor.getAsArray(),
                ambientIntensity: renderable.material.ambientIntensity,
                specularExponent: renderable.material.specularExponent,
                specularShininess: renderable.material.specularShininess,
                cameraPosition: activeCamera.transform.position.getAsArray(),
                'dirLightDirection[0]': getLightValuesAsFlatArray(directionalLights, 'direction'),
                'dirLightAmbientColor[0]': getLightValuesAsFlatArray(directionalLights, 'ambientColor'),
                'dirLightDiffuseColor[0]': getLightValuesAsFlatArray(directionalLights, 'diffuseColor'),
                'dirLightSpecularColor[0]': getLightValuesAsFlatArray(directionalLights, 'specularColor'),
                numDirLights: directionalLights.length,
            };

            if (this.options.useUniformBuffers) ; else {
                for (let u = 0; u < cachedRenderable.uniforms.length; u++) {
                    const uniform = cachedRenderable.uniforms[u];
                    const uniformValue = uniformValueLookupTable[uniform.name];
                    uniform.update(uniformValue);
                }
            }

            // ubos.MatricesUniformUBO.views.modelMatrix.set(renderable.transform.modelMatrix.getAsArray());
            // ubos.MatricesUniformUBO.views.mvp.set(mvp.getAsArray());
            // ubos.MatricesUniformUBO.views.normalMatrix.set(normalMatrix.getAsMat4Array());

            // this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubos.MatricesUniformUBO.webglBuffer);
            // this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, ubos.MatricesUniformUBO.arrayBuffer);
            // this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, ubos.MatricesUniformUBO.blockBinding, ubos.MatricesUniformUBO.webglBuffer);

            // // =============================

            // ubos.MaterialUniformUBO.views.diffuseColor.set(renderable.material.diffuseColor.getAsArray());

            // this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubos.MaterialUniformUBO.webglBuffer);
            // this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, ubos.MaterialUniformUBO.arrayBuffer);
            // this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, ubos.MaterialUniformUBO.blockBinding, ubos.MaterialUniformUBO.webglBuffer);

            // // =============================

            // ubos.SceneUniformUBO.views['directionalLights[0].direction'].set(directionalLights[0].direction.getAsArray());

            // this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubos.SceneUniformUBO.webglBuffer);
            // this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, ubos.SceneUniformUBO.arrayBuffer);
            // this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, ubos.SceneUniformUBO.blockBinding, ubos.SceneUniformUBO.webglBuffer);

            // =============================

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cachedRenderable.indices);
            this.gl.drawElements(this.gl.TRIANGLES, renderable.material.indices.length, this.gl.UNSIGNED_INT, 0);
        }
    }
}

exports.Component = Component;
exports.DirectionalLight = DirectionalLight;
exports.Entity = Entity;
exports.Geometry = Geometry;
exports.Mat3 = Mat3;
exports.Mat4 = Mat4;
exports.OrthographicCamera = OrthographicCamera;
exports.PerspectiveCamera = PerspectiveCamera;
exports.Quat = Quat;
exports.StandardMaterial = StandardMaterial;
exports.TestRenderer = TestRenderer;
exports.Transform3D = Transform3D;
exports.Vec2 = Vec2;
exports.Vec3 = Vec3;
exports.Vec4 = Vec4;
exports.WebGL2Renderer = WebGl2Renderer;
exports.World = World;
