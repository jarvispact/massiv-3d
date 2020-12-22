(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('gl-matrix')) :
    typeof define === 'function' && define.amd ? define(['exports', 'gl-matrix'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MASSIV = {}, global.glMatrix));
}(this, (function (exports, glMatrix) { 'use strict';

    const isSABSupported = () => 'SharedArrayBuffer' in window;

    const getGeometryBufferLayout = (args) => {
        const positionsSize = args.positions.length * Float32Array.BYTES_PER_ELEMENT;
        const indicesSize = args.indices.length * Uint32Array.BYTES_PER_ELEMENT;
        const uvsSize = args.uvs ? args.uvs.length * Float32Array.BYTES_PER_ELEMENT : 0;
        const normalsSize = args.normals ? args.normals.length * Float32Array.BYTES_PER_ELEMENT : 0;
        const colorsSize = args.colors ? args.colors.length * Float32Array.BYTES_PER_ELEMENT : 0;
        const positionsOffset = 0;
        const indicesOffset = positionsSize;
        const uvsOffset = positionsSize + indicesSize;
        const normalsOffset = positionsSize + indicesSize + uvsSize;
        const colorsOffset = positionsSize + indicesSize + uvsSize + normalsSize;
        const bufferSize = positionsSize + indicesSize + uvsSize + normalsSize + colorsSize;
        return {
            bufferSize,
            layout: {
                positions: { offset: positionsOffset, size: args.positions.length },
                indices: { offset: indicesOffset, size: args.indices.length },
                uvs: { offset: uvsOffset, size: args.uvs ? args.uvs.length : 0 },
                normals: { offset: normalsOffset, size: args.normals ? args.normals.length : 0 },
                colors: { offset: colorsOffset, size: args.colors ? args.colors.length : 0 },
            },
        };
    };
    class Geometry {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args) {
            if (args.length === 1) {
                this.type = 'Geometry';
                this.bufferLayout = getGeometryBufferLayout(args[0]);
                this.buffer = isSABSupported() ? new SharedArrayBuffer(this.bufferLayout.bufferSize) : new ArrayBuffer(this.bufferLayout.bufferSize);
                this.data = {
                    positions: new Float32Array(this.buffer, this.bufferLayout.layout.positions.offset, this.bufferLayout.layout.positions.size),
                    indices: new Uint32Array(this.buffer, this.bufferLayout.layout.indices.offset, this.bufferLayout.layout.indices.size),
                    uvs: new Float32Array(this.buffer, this.bufferLayout.layout.uvs.offset, this.bufferLayout.layout.uvs.size),
                    normals: new Float32Array(this.buffer, this.bufferLayout.layout.normals.offset, this.bufferLayout.layout.normals.size),
                    colors: new Float32Array(this.buffer, this.bufferLayout.layout.colors.offset, this.bufferLayout.layout.colors.size),
                };
                this.data.positions.set(args[0].positions);
                this.data.indices.set(args[0].indices);
                this.data.uvs.set(args[0].uvs || []);
                this.data.normals.set(args[0].normals || []);
                this.data.colors.set(args[0].colors || []);
            }
            else if (args.length === 2) {
                this.type = 'Geometry';
                this.bufferLayout = args[0];
                this.buffer = args[1];
                this.data = {
                    positions: new Float32Array(this.buffer, this.bufferLayout.layout.positions.offset, this.bufferLayout.layout.positions.size),
                    indices: new Uint32Array(this.buffer, this.bufferLayout.layout.indices.offset, this.bufferLayout.layout.indices.size),
                    uvs: new Float32Array(this.buffer, this.bufferLayout.layout.uvs.offset, this.bufferLayout.layout.uvs.size),
                    normals: new Float32Array(this.buffer, this.bufferLayout.layout.normals.offset, this.bufferLayout.layout.normals.size),
                    colors: new Float32Array(this.buffer, this.bufferLayout.layout.colors.offset, this.bufferLayout.layout.colors.size),
                };
            }
            else {
                throw new Error('invalid argument length');
            }
        }
        static fromBuffer(bufferLayout, buffer) {
            return new Geometry(bufferLayout, buffer);
        }
    }

    const initialMinArraySize = 3;
    const initialCenterArraySize = 3;
    const initialMaxArraySize = 3;
    const minArraySize = 3;
    const centerArraySize = 3;
    const maxArraySize = 3;
    const initialMinSize = initialMinArraySize * Float32Array.BYTES_PER_ELEMENT;
    const initialCenterSize = initialCenterArraySize * Float32Array.BYTES_PER_ELEMENT;
    const initialMaxSize = initialMaxArraySize * Float32Array.BYTES_PER_ELEMENT;
    const minSize = minArraySize * Float32Array.BYTES_PER_ELEMENT;
    const centerSize = centerArraySize * Float32Array.BYTES_PER_ELEMENT;
    const maxSize = maxArraySize * Float32Array.BYTES_PER_ELEMENT;
    const totalSize = initialMinSize + initialCenterSize + initialMaxSize + minSize + centerSize + maxSize;
    const initialMinOffset = 0;
    const initialCenterOffset = initialMinSize;
    const initialMaxOffset = initialMinSize + initialCenterSize;
    const minOffset = initialMinSize + initialCenterSize + initialMaxSize;
    const centerOffset = initialMinSize + initialCenterSize + initialMaxSize + minSize;
    const maxOffset = initialMinSize + initialCenterSize + initialMaxSize + minSize + centerSize;
    const boundingBoxBufferLayout = {
        initialMin: { offset: initialMinOffset, size: initialMinArraySize },
        initialCenter: { offset: initialCenterOffset, size: initialCenterArraySize },
        initialMax: { offset: initialMaxOffset, size: initialMaxArraySize },
        min: { offset: minOffset, size: minArraySize },
        center: { offset: centerOffset, size: centerArraySize },
        max: { offset: maxOffset, size: maxArraySize },
    };
    class BoundingBox {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args) {
            if (args[0] && typeof args[0].byteLength === 'number') {
                this.type = 'BoundingBox';
                this.buffer = args[0];
                this.data = {
                    _initial: {
                        min: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMin.offset, boundingBoxBufferLayout.initialMin.size),
                        center: new Float32Array(this.buffer, boundingBoxBufferLayout.initialCenter.offset, boundingBoxBufferLayout.initialCenter.size),
                        max: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMax.offset, boundingBoxBufferLayout.initialMax.size),
                    },
                    min: new Float32Array(this.buffer, boundingBoxBufferLayout.min.offset, boundingBoxBufferLayout.min.size),
                    center: new Float32Array(this.buffer, boundingBoxBufferLayout.center.offset, boundingBoxBufferLayout.center.size),
                    max: new Float32Array(this.buffer, boundingBoxBufferLayout.max.offset, boundingBoxBufferLayout.max.size),
                };
            }
            else {
                this.type = 'BoundingBox';
                this.buffer = isSABSupported() ? new SharedArrayBuffer(totalSize) : new ArrayBuffer(totalSize);
                this.data = {
                    _initial: {
                        min: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMin.offset, boundingBoxBufferLayout.initialMin.size),
                        center: new Float32Array(this.buffer, boundingBoxBufferLayout.initialCenter.offset, boundingBoxBufferLayout.initialCenter.size),
                        max: new Float32Array(this.buffer, boundingBoxBufferLayout.initialMax.offset, boundingBoxBufferLayout.initialMax.size),
                    },
                    min: new Float32Array(this.buffer, boundingBoxBufferLayout.min.offset, boundingBoxBufferLayout.min.size),
                    center: new Float32Array(this.buffer, boundingBoxBufferLayout.center.offset, boundingBoxBufferLayout.center.size),
                    max: new Float32Array(this.buffer, boundingBoxBufferLayout.max.offset, boundingBoxBufferLayout.max.size),
                };
                glMatrix.vec3.copy(this.data._initial.min, args[0].min);
                glMatrix.vec3.copy(this.data._initial.center, args[0].center);
                glMatrix.vec3.copy(this.data._initial.max, args[0].max);
                glMatrix.vec3.copy(this.data.min, args[0].min);
                glMatrix.vec3.copy(this.data.center, args[0].center);
                glMatrix.vec3.copy(this.data.max, args[0].max);
            }
        }
        setFromGeometry(geometry, transform) {
            const args = computeBoundingBox(geometry, transform);
            glMatrix.vec3.copy(this.data.min, args.min);
            glMatrix.vec3.copy(this.data.center, args.center);
            glMatrix.vec3.copy(this.data.max, args.max);
        }
        updateFromTransform(transform) {
            glMatrix.vec3.copy(this.data.min, this.data._initial.min);
            glMatrix.vec3.copy(this.data.center, this.data._initial.center);
            glMatrix.vec3.copy(this.data.max, this.data._initial.max);
            glMatrix.vec3.transformMat4(this.data.min, this.data.min, transform.data.modelMatrix);
            glMatrix.vec3.transformMat4(this.data.center, this.data.center, transform.data.modelMatrix);
            glMatrix.vec3.transformMat4(this.data.max, this.data.max, transform.data.modelMatrix);
        }
        getLineGeometry() {
            return getLineGeometryFromBoundingBox(this);
        }
        static fromGeometry(geometry, transform) {
            return new BoundingBox(computeBoundingBox(geometry, transform));
        }
        static fromBuffer(buffer) {
            return new BoundingBox(buffer);
        }
    }
    const computeBoundingBox = (geometry, transform) => {
        const vertices = [];
        for (let p = 0; p < geometry.data.positions.length; p += 3) {
            vertices.push([geometry.data.positions[p], geometry.data.positions[p + 1], geometry.data.positions[p + 2]]);
        }
        const min = [0, 0, 0];
        const center = [0, 0, 0];
        const max = [0, 0, 0];
        // the following separation for index 0 and the rest is done
        // in the case that the geometry is translated, scaled or rotated.
        // initialize from first index 0
        const idx = geometry.data.indices[0];
        const x = vertices[idx][0];
        const y = vertices[idx][1];
        const z = vertices[idx][2];
        min[0] = x;
        min[1] = y;
        min[2] = z;
        max[0] = x;
        max[1] = y;
        max[2] = z;
        // starting at 1
        for (let i = 1; i < geometry.data.indices.length - 1; i++) {
            const idx = geometry.data.indices[i];
            const x = vertices[idx][0];
            const y = vertices[idx][1];
            const z = vertices[idx][2];
            if (x <= min[0])
                min[0] = x;
            if (y <= min[1])
                min[1] = y;
            if (z <= min[2])
                min[2] = z;
            if (x >= max[0])
                max[0] = x;
            if (y >= max[1])
                max[1] = y;
            if (z >= max[2])
                max[2] = z;
        }
        center[0] = (min[0] + max[0]) / 2;
        center[1] = (min[1] + max[1]) / 2;
        center[2] = (min[2] + max[2]) / 2;
        if (transform) {
            glMatrix.vec3.transformMat4(min, min, transform.data.modelMatrix);
            glMatrix.vec3.transformMat4(center, center, transform.data.modelMatrix);
            glMatrix.vec3.transformMat4(max, max, transform.data.modelMatrix);
        }
        return { min, center, max };
    };
    const getLineGeometryFromBoundingBox = (boundingBox) => {
        const min = boundingBox.data.min;
        const max = boundingBox.data.max;
        const positions = new Float32Array([
            min[0], min[1], max[2],
            max[0], min[1], max[2],
            min[0], max[1], max[2],
            max[0], max[1], max[2],
            min[0], min[1], min[2],
            max[0], min[1], min[2],
            min[0], max[1], min[2],
            max[0], max[1], min[2],
        ]);
        const indices = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 1, 5, 3, 7, 0, 4, 2, 6, 0, 2, 1, 3, 4, 6, 5, 7]);
        return new Geometry({ positions, indices });
    };
    // const positions = new Float32Array([
    //     // line 1
    //     min[0], min[1], max[2], // -x -y +z
    //     max[0], min[1], max[2], // +x -y +z
    //     // line 2
    //     min[0], max[1], max[2], // -x +y +z
    //     max[0], max[1], max[2], // +x +y +z
    //     // line 3
    //     min[0], min[1], min[2], // -x -y -z
    //     max[0], min[1], min[2], // +x -y -z
    //     // line 4
    //     min[0], max[1], min[2], // -x +y -z
    //     max[0], max[1], min[2], // +x +y -z
    //     // line 5
    //     max[0], min[1], max[2], // +x -y +z
    //     max[0], min[1], min[2], // +x -y -z
    //     // line 6
    //     max[0], max[1], max[2], // +x +y +z
    //     max[0], max[1], min[2], // +x +y -z
    //     // line 5
    //     min[0], min[1], max[2], // -x -y +z
    //     min[0], min[1], min[2], // -x -y -z
    //     // line 6
    //     min[0], max[1], max[2], // -x +y +z
    //     min[0], max[1], min[2], // -x +y -z
    //     // line 7
    //     min[0], min[1], max[2], // -x -y +z
    //     min[0], max[1], max[2], // -x +y +z
    //     // line 8
    //     max[0], min[1], max[2], // +x -y +z
    //     max[0], max[1], max[2], // +x +y +z
    //     // line 9
    //     min[0], min[1], min[2], // -x -y -z
    //     min[0], max[1], min[2], // -x +y -z
    //     // line 10
    //     max[0], min[1], min[2], // +x -y -z
    //     max[0], max[1], min[2], // +x +y -z
    // ]);

    class DirectionalLight {
        constructor(args = {}) {
            this.type = 'DirectionalLight';
            this.data = {
                direction: args.direction || glMatrix.vec3.fromValues(3, 5, 1),
                diffuseColor: args.diffuseColor || glMatrix.vec3.fromValues(1, 1, 1),
                specularColor: args.specularColor || glMatrix.vec3.fromValues(1, 1, 1),
            };
            this.dirty = true;
        }
        setDiffuseColor(r, g, b) {
            this.data.diffuseColor[0] = r;
            this.data.diffuseColor[1] = g;
            this.data.diffuseColor[2] = b;
            this.dirty = true;
        }
        isDirty() {
            return this.dirty;
        }
        setDirty(dirty) {
            this.dirty = dirty;
            return this;
        }
    }

    class PerspectiveCamera {
        constructor(args) {
            this.type = 'PerspectiveCamera';
            this.data = {
                translation: args.translation || glMatrix.vec3.fromValues(0, 0, 0),
                upVector: args.upVector || glMatrix.vec3.fromValues(0, 1, 0),
                viewMatrix: glMatrix.mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
                projectionMatrix: glMatrix.mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
                fov: args.fov || 45,
                aspect: args.aspect,
                near: args.near || 0.01,
                far: args.far || 1000,
            };
            glMatrix.mat4.lookAt(this.data.viewMatrix, this.data.translation, [0, 0, 0], this.data.upVector);
            glMatrix.mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
            this.dirty = true;
        }
        setTranslation(x, y, z) {
            this.data.translation[0] = x;
            this.data.translation[1] = y;
            this.data.translation[2] = z;
            glMatrix.mat4.lookAt(this.data.viewMatrix, this.data.translation, [0, 0, 0], this.data.upVector);
            this.dirty = true;
            return this;
        }
        setAspect(aspect) {
            this.data.aspect = aspect;
            glMatrix.mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
            this.dirty = true;
            return this;
        }
        setFov(fov) {
            this.data.fov = fov;
            glMatrix.mat4.perspective(this.data.projectionMatrix, this.data.fov, this.data.aspect, this.data.near, this.data.far);
            this.dirty = true;
            return this;
        }
        isDirty() {
            return this.dirty;
        }
        setDirty(dirty) {
            this.dirty = dirty;
            return this;
        }
    }

    class PhongMaterial {
        constructor(args = {}) {
            this.type = 'PhongMaterial';
            this.data = {
                ambientIntensity: args.ambientIntensity || 0.01,
                diffuseColor: args.diffuseColor || glMatrix.vec3.fromValues(1, 1, 1),
                specularColor: args.specularColor || glMatrix.vec3.fromValues(1, 1, 1),
                specularExponent: args.specularExponent || 256,
                opacity: args.opacity || 1,
            };
            this.dirty = true;
        }
        setDiffuseColor(r, g, b) {
            this.data.diffuseColor[0] = r;
            this.data.diffuseColor[1] = g;
            this.data.diffuseColor[2] = b;
            this.dirty = true;
        }
        isDirty() {
            return this.dirty;
        }
        setDirty(dirty) {
            this.dirty = dirty;
            return this;
        }
    }

    const translationArraySize = 3;
    const scalingArraySize = 3;
    const quaternionArraySize = 4;
    const modelMatrixArraySize = 16;
    const dirtyArraySize = 1;
    const translationSize = translationArraySize * Float32Array.BYTES_PER_ELEMENT;
    const scalingSize = scalingArraySize * Float32Array.BYTES_PER_ELEMENT;
    const quaternionSize = quaternionArraySize * Float32Array.BYTES_PER_ELEMENT;
    const modelMatrixSize = modelMatrixArraySize * Float32Array.BYTES_PER_ELEMENT;
    const dirtySize = dirtyArraySize * Float32Array.BYTES_PER_ELEMENT;
    const totalSize$1 = translationSize + scalingSize + quaternionSize + modelMatrixSize + dirtySize;
    const translationOffset = 0;
    const scalingOffset = translationSize;
    const quaternionOffset = translationSize + scalingSize;
    const modelMatrixOffset = translationSize + scalingSize + quaternionSize;
    const dirtyOffset = translationSize + scalingSize + quaternionSize + modelMatrixSize;
    const bufferLayout = {
        translation: { offset: translationOffset, size: translationArraySize },
        scaling: { offset: scalingOffset, size: scalingArraySize },
        quaternion: { offset: quaternionOffset, size: quaternionArraySize },
        modelMatrix: { offset: modelMatrixOffset, size: modelMatrixArraySize },
        dirty: { offset: dirtyOffset, size: dirtyArraySize },
    };
    const tmp = {
        vec3: glMatrix.vec3.create(),
        quat: glMatrix.quat.create(),
    };
    class Transform {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args) {
            if (args[0] && typeof args[0].byteLength === 'number') {
                this.type = 'Transform';
                this.buffer = args[0];
                this.data = {
                    translation: new Float32Array(this.buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
                    scaling: new Float32Array(this.buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
                    quaternion: new Float32Array(this.buffer, bufferLayout.quaternion.offset, bufferLayout.quaternion.size),
                    modelMatrix: new Float32Array(this.buffer, bufferLayout.modelMatrix.offset, bufferLayout.modelMatrix.size),
                    dirty: new Float32Array(this.buffer, bufferLayout.dirty.offset, bufferLayout.dirty.size),
                };
            }
            else {
                this.type = 'Transform';
                this.buffer = isSABSupported() ? new SharedArrayBuffer(totalSize$1) : new ArrayBuffer(totalSize$1);
                this.data = {
                    translation: new Float32Array(this.buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
                    scaling: new Float32Array(this.buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
                    quaternion: new Float32Array(this.buffer, bufferLayout.quaternion.offset, bufferLayout.quaternion.size),
                    modelMatrix: new Float32Array(this.buffer, bufferLayout.modelMatrix.offset, bufferLayout.modelMatrix.size),
                    dirty: new Float32Array(this.buffer, bufferLayout.dirty.offset, bufferLayout.dirty.size),
                };
                if (args[0] && args[0].translation) {
                    this.setTranslation(args[0].translation[0], args[0].translation[1], args[0].translation[2]);
                }
                else {
                    this.setTranslation(0, 0, 0);
                }
                if (args[0] && args[0].scaling) {
                    this.setScale(args[0].scaling[0], args[0].scaling[1], args[0].scaling[2]);
                }
                else {
                    this.setScale(1, 1, 1);
                }
                if (args[0] && args[0].quaternion) {
                    this.setQuaternion(args[0].quaternion[0], args[0].quaternion[1], args[0].quaternion[2], args[0].quaternion[3]);
                }
                else {
                    this.setQuaternion(0, 0, 0, 1);
                }
                this.setDirty().update();
            }
        }
        isDirty() {
            return this.data.dirty[0] === 1;
        }
        setDirty(dirty = true) {
            this.data.dirty[0] = Number(dirty);
            return this;
        }
        update() {
            if (this.isDirty()) {
                glMatrix.mat4.fromRotationTranslationScale(this.data.modelMatrix, this.data.quaternion, this.data.translation, this.data.scaling);
            }
            return this;
        }
        setTranslation(x, y, z) {
            this.data.translation[0] = x;
            this.data.translation[1] = y;
            this.data.translation[2] = z;
            this.setDirty();
            return this;
        }
        setTranslationX(x) {
            this.data.translation[0] = x;
            this.setDirty();
            return this;
        }
        setTranslationY(y) {
            this.data.translation[1] = y;
            this.setDirty();
            return this;
        }
        setTranslationZ(z) {
            this.data.translation[2] = z;
            this.setDirty();
            return this;
        }
        setScale(x, y, z) {
            this.data.scaling[0] = x;
            this.data.scaling[1] = y;
            this.data.scaling[2] = z;
            this.setDirty();
            return this;
        }
        setScaleX(x) {
            this.data.scaling[0] = x;
            this.setDirty();
            return this;
        }
        setScaleY(y) {
            this.data.scaling[1] = y;
            this.setDirty();
            return this;
        }
        setScaleZ(z) {
            this.data.scaling[2] = z;
            this.setDirty();
            return this;
        }
        setQuaternion(x, y, z, w) {
            this.data.quaternion[0] = x;
            this.data.quaternion[1] = y;
            this.data.quaternion[2] = z;
            this.data.quaternion[3] = w;
            this.setDirty();
            return this;
        }
        setQuaternionX(x) {
            this.data.quaternion[0] = x;
            this.setDirty();
            return this;
        }
        setQuaternionY(y) {
            this.data.quaternion[1] = y;
            this.setDirty();
            return this;
        }
        setQuaternionZ(z) {
            this.data.quaternion[2] = z;
            this.setDirty();
            return this;
        }
        setQuaternionW(w) {
            this.data.quaternion[3] = w;
            this.setDirty();
            return this;
        }
        translate(x, y, z) {
            tmp.vec3[0] = x;
            tmp.vec3[1] = y;
            tmp.vec3[2] = z;
            glMatrix.vec3.add(this.data.translation, this.data.translation, tmp.vec3);
            this.setDirty();
            return this;
        }
        scale(x, y, z) {
            tmp.vec3[0] = x;
            tmp.vec3[1] = y;
            tmp.vec3[2] = z;
            glMatrix.vec3.add(this.data.scaling, this.data.scaling, tmp.vec3);
            this.setDirty();
            return this;
        }
        rotate(x, y, z) {
            glMatrix.quat.fromEuler(tmp.quat, x, y, z);
            glMatrix.quat.multiply(this.data.quaternion, this.data.quaternion, tmp.quat);
            this.setDirty();
            return this;
        }
        static fromBuffer(buffer) {
            return new Transform(buffer);
        }
    }

    const intersection = (list1, list2) => list1.filter(x => list2.includes(x));

    const hasMoreThanOneComponentsOfSameType = (componentTypes) => [...new Set(componentTypes)].length < componentTypes.length;
    class Entity {
        constructor(name, components) {
            this.name = name;
            this.componentTypes = components.map(c => c.type);
            this.components = components.reduce((accum, comp) => {
                accum[comp.type] = comp;
                return accum;
            }, {});
            if (hasMoreThanOneComponentsOfSameType(this.componentTypes)) {
                throw new Error('a entity can only one component of any type');
            }
        }
        getComponentByType(type) {
            return this.components[type];
        }
        getComponentByClass(klass) {
            return this.components[klass.name];
        }
        getComponentTypes() {
            return this.componentTypes;
        }
        getComponents() {
            return Object.values(this.components).filter(Boolean);
        }
        addComponent(component) {
            if (this.componentTypes.includes(component.type)) {
                throw new Error('a entity can only one component of any type');
            }
            this.components[component.type] = component;
            this.componentTypes.push(component.type);
            return this;
        }
        removeComponent(component) {
            this.components[component.type] = undefined;
            this.componentTypes = this.componentTypes.filter(t => t !== component.type);
            return this;
        }
        removeComponentByType(type) {
            const comp = this.getComponentByType(type);
            if (comp)
                this.removeComponent(comp);
            return this;
        }
        removeComponentByClass(component) {
            const comp = this.getComponentByType(component.constructor.name);
            if (comp)
                this.removeComponent(comp);
            return this;
        }
        hasComponents(types) {
            return intersection(types, this.getComponentTypes()).length === types.length;
        }
    }

    const createGetDelta = (then = 0) => (now) => {
        now *= 0.001;
        const delta = now - then;
        then = now;
        return delta;
    };
    const addEntity = (entity) => ({ type: 'ADD-ENTITY', payload: entity });
    const removeEntity = (entity) => ({ type: 'REMOVE-ENTITY', payload: entity });
    const worldActions = {
        addEntity,
        removeEntity,
    };
    const actionValues = Object.values(worldActions)[0];
    const defaultReducer = (state) => state;
    class World {
        constructor(args = {}) {
            this.subscribers = [];
            this.getDelta = createGetDelta();
            this.entities = [];
            this.entitiesByName = {};
            this.systems = [];
            this.queryCache = [];
            this.state = args.initialState;
            this.reducer = args.reducer || defaultReducer;
        }
        dispatch(action) {
            const newState = this.reducer(this.state, action);
            for (let i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i](action, newState, this.state);
            }
            this.state = newState;
            return this;
        }
        subscribe(callback) {
            this.subscribers.push(callback);
            return this;
        }
        getEntity(entityName) {
            return this.entitiesByName[entityName];
        }
        addEntity(entity) {
            this.entities.push(entity);
            this.entitiesByName[entity.name] = entity;
            this.dispatch(worldActions.addEntity(entity));
            return this;
        }
        removeEntity(entity) {
            this.entities = this.entities.filter(e => e !== entity);
            this.entitiesByName[entity.name] = null;
            this.dispatch(worldActions.removeEntity(entity));
            return this;
        }
        removeEntityByName(entityName) {
            const entity = this.getEntity(entityName);
            if (entity)
                this.removeEntity(entity);
            return this;
        }
        addSystem(system) {
            this.systems.push(system);
            return this;
        }
        removeSystem(system) {
            this.systems = this.systems.filter(s => s !== system);
            return this;
        }
        queryEntities(requiredComponents) {
            this.queryCache.length = 0;
            for (let e = 0; e < this.entities.length; e++) {
                const entity = this.entities[e];
                if (intersection(requiredComponents, entity.getComponentTypes()).length === requiredComponents.length) {
                    this.queryCache.push(entity);
                }
            }
            return this.queryCache;
        }
        update(time) {
            const delta = this.getDelta(time);
            for (let s = 0; s < this.systems.length; s++) {
                this.systems[s](delta, time);
            }
            return this;
        }
    }

    const KEY = {
        A: 'a',
        B: 'b',
        C: 'c',
        D: 'd',
        E: 'e',
        F: 'f',
        G: 'g',
        H: 'h',
        I: 'i',
        J: 'j',
        K: 'k',
        L: 'l',
        M: 'm',
        N: 'n',
        O: 'o',
        P: 'p',
        Q: 'q',
        R: 'r',
        S: 's',
        T: 't',
        U: 'u',
        V: 'v',
        W: 'w',
        X: 'x',
        Y: 'y',
        Z: 'z',
        NUM_0: '0',
        NUM_1: '1',
        NUM_2: '2',
        NUM_3: '3',
        NUM_4: '4',
        NUM_5: '5',
        NUM_6: '6',
        NUM_7: '7',
        NUM_8: '8',
        NUM_9: '9',
        SPACE: ' ',
        ARROW_UP: 'ArrowUp',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_RIGHT: 'ArrowRight',
        ARROW_DOWN: 'ArrowDown',
    };
    class KeyboardInput {
        constructor(canvas) {
            this.keydownCallbacks = [];
            this.keyupCallbacks = [];
            this.canvas = canvas;
            this.canvas.setAttribute('tabIndex', '1');
            if (document.activeElement !== canvas)
                canvas.focus();
            this.keyDownMap = Object.values(KEY).reduce((accum, value) => {
                accum[value] = false;
                return accum;
            }, {});
            const keyDownHandler = (event) => {
                this.keyDownMap[event.key] = true;
                for (let i = 0; i < this.keydownCallbacks.length; i++) {
                    this.keydownCallbacks[i](event);
                }
            };
            const keyUpHandler = (event) => {
                this.keyDownMap[event.key] = false;
                for (let i = 0; i < this.keyupCallbacks.length; i++) {
                    this.keyupCallbacks[i](event);
                }
            };
            this.canvas.addEventListener('keydown', keyDownHandler);
            this.canvas.addEventListener('keyup', keyUpHandler);
        }
        static get KEY() {
            return KEY;
        }
        isKeyDown(key) {
            return this.keyDownMap[KEY[key]];
        }
        onKeyUp(callback) {
            this.keyupCallbacks.push(callback);
            return this;
        }
        onKeyDown(callback) {
            this.keydownCallbacks.push(callback);
            return this;
        }
    }

    const BUTTON = {
        PRIMARY: 0,
        AUXILIARY: 1,
        SECONDARY: 2,
    };
    class MouseInput {
        constructor(canvas) {
            this.mousedownCallbacks = [];
            this.mouseupCallbacks = [];
            this.canvas = canvas;
            this.canvas.setAttribute('tabIndex', '1');
            if (document.activeElement !== canvas)
                canvas.focus();
            this.buttonDownMap = Object.values(BUTTON).reduce((accum, value) => {
                accum[value] = false;
                return accum;
            }, {});
            this.mouseX = 0;
            this.mouseY = 0;
            this.wheelY = 0;
            const mouseDownHandler = (event) => {
                for (let i = 0; i < this.mousedownCallbacks.length; i++) {
                    this.mousedownCallbacks[i](event);
                }
                switch (event.button) {
                    case BUTTON.PRIMARY:
                        this.buttonDownMap[BUTTON.PRIMARY] = true;
                        break;
                    case BUTTON.AUXILIARY:
                        this.buttonDownMap[BUTTON.AUXILIARY] = true;
                        break;
                    case BUTTON.SECONDARY:
                        this.buttonDownMap[BUTTON.SECONDARY] = true;
                        break;
                }
            };
            const mouseMoveHandler = (event) => {
                this.mouseX = event.offsetX;
                this.mouseY = event.offsetY;
            };
            const mouseUpHandler = (event) => {
                for (let i = 0; i < this.mouseupCallbacks.length; i++) {
                    this.mouseupCallbacks[i](event);
                }
                switch (event.button) {
                    case BUTTON.PRIMARY:
                        this.buttonDownMap[BUTTON.PRIMARY] = false;
                        break;
                    case BUTTON.AUXILIARY:
                        this.buttonDownMap[BUTTON.AUXILIARY] = false;
                        break;
                    case BUTTON.SECONDARY:
                        this.buttonDownMap[BUTTON.SECONDARY] = false;
                        break;
                }
            };
            const wheelHandler = (event) => {
                this.wheelY = event.deltaY;
            };
            this.canvas.addEventListener('mousedown', mouseDownHandler);
            this.canvas.addEventListener('mousemove', mouseMoveHandler);
            this.canvas.addEventListener('mouseup', mouseUpHandler);
            this.canvas.addEventListener('wheel', wheelHandler);
        }
        static get BUTTON() {
            return BUTTON;
        }
        isButtonDown(button) {
            return this.buttonDownMap[BUTTON[button]];
        }
        getMouseX() {
            return this.mouseX;
        }
        getMouseY() {
            return this.mouseY;
        }
        getWheelY() {
            const val = this.wheelY;
            this.wheelY = 0;
            return val;
        }
        onButtonDown(callback) {
            this.mousedownCallbacks.push(callback);
            return this;
        }
        onButtonUp(callback) {
            this.mouseupCallbacks.push(callback);
            return this;
        }
    }

    const FileLoader = {
        load: async (filePath) => fetch(filePath).then(response => response.text()),
    };

    const ImageLoader = {
        load: async (imageSrcUrl) => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`error loading image from url: "${imageSrcUrl}"`));
            img.src = imageSrcUrl;
        }),
    };

    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;
    const degreesToRadians = (degrees) => degrees * DEG_TO_RAD;
    const radiansToDegrees = (radians) => radians * RAD_TO_DEG;

    const toFloat = (val) => Number.parseFloat(val);

    const toInt = (val) => Number.parseInt(val, 10);

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const objectRegex = /^o\s(.*)$/;
    const useMaterialRegex = /^usemtl\s(.*)$/;
    const vertexPositionRegex = /^v\s(\S+)\s(\S+)\s(\S+)$/;
    const vertexUvRegex = /^vt\s(\S+)\s(\S+)$/;
    const vertexNormalRegex = /^vn\s(\S+)\s(\S+)\s(\S+)$/;
    const triangleFaceRegex = /^f\s(\S+)\s(\S+)\s(\S+)$/;
    const quadFaceRegex = /^f\s(\S+)\s(\S+)\s(\S+)\s(\S+)$/;
    const vRegex = /^(\d{1,})$/;
    const vnRegex = /^(\d{1,})\/\/(\d{1,})$/;
    const vuRegex = /^(\d{1,})\/(\d{1,})$/;
    const vnuRegex = /^(\d{1,})\/(\d{1,})\/(\d{1,})$/;
    const correctIndex = (idx) => idx - 1;
    const defaultConfig = {
        uvRotationDegrees: 0,
    };
    const createObjFileParser = (config) => {
        const cfg = config ? Object.assign(Object.assign({}, defaultConfig), config) : defaultConfig;
        const uvRotationMatrix = glMatrix.mat2.create();
        glMatrix.mat2.rotate(uvRotationMatrix, uvRotationMatrix, degreesToRadians(cfg.uvRotationDegrees));
        return (objFileContent, materials = []) => {
            const objDataLines = objFileContent.trim().split('\n');
            const cache = {};
            let indexCounter = 0;
            const allPositions = [];
            const allUvs = [];
            const allNormals = [];
            const primitives = [];
            const do_v_vertex = (primitive, p_index) => {
                const cached = cache[p_index];
                if (cached !== undefined) {
                    primitive.indices.push(cached);
                }
                else {
                    primitive.positions.push(...[...allPositions[p_index]]);
                    primitive.indices.push(indexCounter);
                    cache[p_index] = indexCounter;
                    indexCounter += 1;
                }
            };
            const do_vu_vertex = (primitive, p_index, u_index) => {
                const cached = cache[`${p_index}-${u_index}`];
                if (cached !== undefined) {
                    primitive.indices.push(cached);
                }
                else {
                    primitive.positions.push(...[...allPositions[p_index]]);
                    primitive.uvs.push(...[...allUvs[u_index]]);
                    primitive.indices.push(indexCounter);
                    cache[`${p_index}-${u_index}`] = indexCounter;
                    indexCounter += 1;
                }
            };
            const do_vn_vertex = (primitive, p_index, n_index) => {
                const cached = cache[`${p_index}-${n_index}`];
                if (cached !== undefined) {
                    primitive.indices.push(cached);
                }
                else {
                    primitive.positions.push(...[...allPositions[p_index]]);
                    primitive.normals.push(...[...allNormals[n_index]]);
                    primitive.indices.push(indexCounter);
                    cache[`${p_index}-${n_index}`] = indexCounter;
                    indexCounter += 1;
                }
            };
            const do_vnu_vertex = (primitive, p_index, u_index, n_index) => {
                const cached = cache[`${p_index}-${u_index}-${n_index}`];
                if (cached !== undefined) {
                    primitive.indices.push(cached);
                }
                else {
                    primitive.positions.push(...[...allPositions[p_index]]);
                    primitive.uvs.push(...[...allUvs[u_index]]);
                    primitive.normals.push(...[...allNormals[n_index]]);
                    primitive.indices.push(indexCounter);
                    cache[`${p_index}-${u_index}-${n_index}`] = indexCounter;
                    indexCounter += 1;
                }
            };
            for (let lineIndex = 0; lineIndex < objDataLines.length; lineIndex++) {
                const line = objDataLines[lineIndex].trim();
                if (!line)
                    continue;
                // ========================================================
                // parse positions, normals and uvs into nested vec3 arrays
                const vertexPositionMatch = line.match(vertexPositionRegex);
                if (vertexPositionMatch) {
                    const [, x, y, z] = vertexPositionMatch;
                    allPositions.push([toFloat(x), toFloat(y), toFloat(z)]);
                }
                const vertexUvMatch = line.match(vertexUvRegex);
                if (vertexUvMatch) {
                    const [, x, y] = vertexUvMatch;
                    const uvs = glMatrix.vec2.fromValues(toFloat(x), toFloat(y));
                    glMatrix.vec2.transformMat2(uvs, uvs, uvRotationMatrix);
                    allUvs.push([uvs[0], uvs[1]]);
                }
                const vertexNormalMatch = line.match(vertexNormalRegex);
                if (vertexNormalMatch) {
                    const [, x, y, z] = vertexNormalMatch;
                    allNormals.push([toFloat(x), toFloat(y), toFloat(z)]);
                }
                // =============================================
                // set materialIndex on current Primitive
                // and handle multi material objects
                const useMaterialMatch = line.match(useMaterialRegex);
                if (useMaterialMatch && materials.length) {
                    const [, name] = useMaterialMatch;
                    const currentMaterialIndex = materials.findIndex(m => m.name === name);
                    const currentPrimitive = primitives[primitives.length - 1];
                    if (currentPrimitive && currentPrimitive.indices.length === 0) {
                        currentPrimitive.materialIndex = currentMaterialIndex;
                    }
                    else if (currentPrimitive && currentPrimitive.indices.length > 0) {
                        primitives.push({ name: `${currentPrimitive.name}.MULTIMATERIAL.${currentMaterialIndex}`, positions: [], uvs: [], normals: [], indices: [], materialIndex: currentMaterialIndex, triangleCount: 0 });
                        indexCounter = 0;
                    }
                }
                // ==============================================
                // ensure we are working on the correct primitive
                const primitiveMatch = line.match(objectRegex);
                if (primitiveMatch) {
                    const [, name] = primitiveMatch;
                    primitives.push({ name, positions: [], uvs: [], normals: [], indices: [], materialIndex: -1, triangleCount: 0 });
                    const prevoiusPrimitive = primitives[primitives.length - 2];
                    if (prevoiusPrimitive)
                        indexCounter = 0;
                }
                const currentPrimitive = primitives[primitives.length - 1];
                // ====================
                // triangle face layout
                const triangleFaceMatch = line.match(triangleFaceRegex);
                if (triangleFaceMatch) {
                    const [, v1, v2, v3] = triangleFaceMatch;
                    // ====================
                    // position only layout
                    const v1_match = v1.match(vRegex);
                    const v2_match = v2.match(vRegex);
                    const v3_match = v3.match(vRegex);
                    if (v1_match && v2_match && v3_match) {
                        const [, p_idx_1] = v1_match;
                        const [, p_idx_2] = v2_match;
                        const [, p_idx_3] = v3_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        do_v_vertex(currentPrimitive, p_index_1);
                        do_v_vertex(currentPrimitive, p_index_2);
                        do_v_vertex(currentPrimitive, p_index_3);
                        currentPrimitive.triangleCount++;
                    }
                    // ======================
                    // position and uv layout
                    const vu1_match = v1.match(vuRegex);
                    const vu2_match = v2.match(vuRegex);
                    const vu3_match = v3.match(vuRegex);
                    if (vu1_match && vu2_match && vu3_match) {
                        const [, p_idx_1, u_idx_1] = vu1_match;
                        const [, p_idx_2, u_idx_2] = vu2_match;
                        const [, p_idx_3, u_idx_3] = vu3_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const u_index_1 = correctIndex(toInt(u_idx_1));
                        const u_index_2 = correctIndex(toInt(u_idx_2));
                        const u_index_3 = correctIndex(toInt(u_idx_3));
                        do_vu_vertex(currentPrimitive, p_index_1, u_index_1);
                        do_vu_vertex(currentPrimitive, p_index_2, u_index_2);
                        do_vu_vertex(currentPrimitive, p_index_3, u_index_3);
                        currentPrimitive.triangleCount++;
                    }
                    // ==========================
                    // position and normal layout
                    const vn1_match = v1.match(vnRegex);
                    const vn2_match = v2.match(vnRegex);
                    const vn3_match = v3.match(vnRegex);
                    if (vn1_match && vn2_match && vn3_match) {
                        const [, p_idx_1, n_idx_1] = vn1_match;
                        const [, p_idx_2, n_idx_2] = vn2_match;
                        const [, p_idx_3, n_idx_3] = vn3_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const n_index_1 = correctIndex(toInt(n_idx_1));
                        const n_index_2 = correctIndex(toInt(n_idx_2));
                        const n_index_3 = correctIndex(toInt(n_idx_3));
                        do_vn_vertex(currentPrimitive, p_index_1, n_index_1);
                        do_vn_vertex(currentPrimitive, p_index_2, n_index_2);
                        do_vn_vertex(currentPrimitive, p_index_3, n_index_3);
                        currentPrimitive.triangleCount++;
                    }
                    // ==============================
                    // position, uv and normal layout
                    const vnu1_match = v1.match(vnuRegex);
                    const vnu2_match = v2.match(vnuRegex);
                    const vnu3_match = v3.match(vnuRegex);
                    if (vnu1_match && vnu2_match && vnu3_match) {
                        const [, p_idx_1, u_idx_1, n_idx_1] = vnu1_match;
                        const [, p_idx_2, u_idx_2, n_idx_2] = vnu2_match;
                        const [, p_idx_3, u_idx_3, n_idx_3] = vnu3_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const u_index_1 = correctIndex(toInt(u_idx_1));
                        const u_index_2 = correctIndex(toInt(u_idx_2));
                        const u_index_3 = correctIndex(toInt(u_idx_3));
                        const n_index_1 = correctIndex(toInt(n_idx_1));
                        const n_index_2 = correctIndex(toInt(n_idx_2));
                        const n_index_3 = correctIndex(toInt(n_idx_3));
                        do_vnu_vertex(currentPrimitive, p_index_1, u_index_1, n_index_1);
                        do_vnu_vertex(currentPrimitive, p_index_2, u_index_2, n_index_2);
                        do_vnu_vertex(currentPrimitive, p_index_3, u_index_3, n_index_3);
                        currentPrimitive.triangleCount++;
                    }
                }
                // ================
                // quad face layout
                const quadFaceMatch = line.match(quadFaceRegex);
                if (quadFaceMatch) {
                    const [, v1, v2, v3, v4] = quadFaceMatch;
                    // ====================
                    // position only layout
                    const v1_match = v1.match(vRegex);
                    const v2_match = v2.match(vRegex);
                    const v3_match = v3.match(vRegex);
                    const v4_match = v4.match(vRegex);
                    if (v1_match && v2_match && v3_match && v4_match) {
                        const [, p_idx_1] = v1_match;
                        const [, p_idx_2] = v2_match;
                        const [, p_idx_3] = v3_match;
                        const [, p_idx_4] = v4_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const p_index_4 = correctIndex(toInt(p_idx_4));
                        do_v_vertex(currentPrimitive, p_index_1);
                        do_v_vertex(currentPrimitive, p_index_2);
                        do_v_vertex(currentPrimitive, p_index_3);
                        do_v_vertex(currentPrimitive, p_index_1);
                        do_v_vertex(currentPrimitive, p_index_3);
                        do_v_vertex(currentPrimitive, p_index_4);
                        currentPrimitive.triangleCount += 2;
                    }
                    // ======================
                    // position and uv layout
                    const vu1_match = v1.match(vuRegex);
                    const vu2_match = v2.match(vuRegex);
                    const vu3_match = v3.match(vuRegex);
                    const vu4_match = v4.match(vuRegex);
                    if (vu1_match && vu2_match && vu3_match && vu4_match) {
                        const [, p_idx_1, u_idx_1] = vu1_match;
                        const [, p_idx_2, u_idx_2] = vu2_match;
                        const [, p_idx_3, u_idx_3] = vu3_match;
                        const [, p_idx_4, u_idx_4] = vu4_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const p_index_4 = correctIndex(toInt(p_idx_4));
                        const u_index_1 = correctIndex(toInt(u_idx_1));
                        const u_index_2 = correctIndex(toInt(u_idx_2));
                        const u_index_3 = correctIndex(toInt(u_idx_3));
                        const u_index_4 = correctIndex(toInt(u_idx_4));
                        do_vu_vertex(currentPrimitive, p_index_1, u_index_1);
                        do_vu_vertex(currentPrimitive, p_index_2, u_index_2);
                        do_vu_vertex(currentPrimitive, p_index_3, u_index_3);
                        do_vu_vertex(currentPrimitive, p_index_1, u_index_1);
                        do_vu_vertex(currentPrimitive, p_index_3, u_index_3);
                        do_vu_vertex(currentPrimitive, p_index_4, u_index_4);
                        currentPrimitive.triangleCount += 2;
                    }
                    // ==========================
                    // position and normal layout
                    const vn1_match = v1.match(vnRegex);
                    const vn2_match = v2.match(vnRegex);
                    const vn3_match = v3.match(vnRegex);
                    const vn4_match = v4.match(vnRegex);
                    if (vn1_match && vn2_match && vn3_match && vn4_match) {
                        const [, p_idx_1, n_idx_1] = vn1_match;
                        const [, p_idx_2, n_idx_2] = vn2_match;
                        const [, p_idx_3, n_idx_3] = vn3_match;
                        const [, p_idx_4, n_idx_4] = vn4_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const p_index_4 = correctIndex(toInt(p_idx_4));
                        const n_index_1 = correctIndex(toInt(n_idx_1));
                        const n_index_2 = correctIndex(toInt(n_idx_2));
                        const n_index_3 = correctIndex(toInt(n_idx_3));
                        const n_index_4 = correctIndex(toInt(n_idx_4));
                        do_vn_vertex(currentPrimitive, p_index_1, n_index_1);
                        do_vn_vertex(currentPrimitive, p_index_2, n_index_2);
                        do_vn_vertex(currentPrimitive, p_index_3, n_index_3);
                        do_vn_vertex(currentPrimitive, p_index_1, n_index_1);
                        do_vn_vertex(currentPrimitive, p_index_3, n_index_3);
                        do_vn_vertex(currentPrimitive, p_index_4, n_index_4);
                        currentPrimitive.triangleCount += 2;
                    }
                    // ==============================
                    // position, uv and normal layout
                    const vnu1_match = v1.match(vnuRegex);
                    const vnu2_match = v2.match(vnuRegex);
                    const vnu3_match = v3.match(vnuRegex);
                    const vnu4_match = v4.match(vnuRegex);
                    if (vnu1_match && vnu2_match && vnu3_match && vnu4_match) {
                        const [, p_idx_1, u_idx_1, n_idx_1] = vnu1_match;
                        const [, p_idx_2, u_idx_2, n_idx_2] = vnu2_match;
                        const [, p_idx_3, u_idx_3, n_idx_3] = vnu3_match;
                        const [, p_idx_4, u_idx_4, n_idx_4] = vnu4_match;
                        const p_index_1 = correctIndex(toInt(p_idx_1));
                        const p_index_2 = correctIndex(toInt(p_idx_2));
                        const p_index_3 = correctIndex(toInt(p_idx_3));
                        const p_index_4 = correctIndex(toInt(p_idx_4));
                        const u_index_1 = correctIndex(toInt(u_idx_1));
                        const u_index_2 = correctIndex(toInt(u_idx_2));
                        const u_index_3 = correctIndex(toInt(u_idx_3));
                        const u_index_4 = correctIndex(toInt(u_idx_4));
                        const n_index_1 = correctIndex(toInt(n_idx_1));
                        const n_index_2 = correctIndex(toInt(n_idx_2));
                        const n_index_3 = correctIndex(toInt(n_idx_3));
                        const n_index_4 = correctIndex(toInt(n_idx_4));
                        do_vnu_vertex(currentPrimitive, p_index_1, u_index_1, n_index_1);
                        do_vnu_vertex(currentPrimitive, p_index_2, u_index_2, n_index_2);
                        do_vnu_vertex(currentPrimitive, p_index_3, u_index_3, n_index_3);
                        do_vnu_vertex(currentPrimitive, p_index_1, u_index_1, n_index_1);
                        do_vnu_vertex(currentPrimitive, p_index_3, u_index_3, n_index_3);
                        do_vnu_vertex(currentPrimitive, p_index_4, u_index_4, n_index_4);
                        currentPrimitive.triangleCount += 2;
                    }
                }
            }
            return primitives;
        };
    };
    const parseObjFile = createObjFileParser();

    const newMaterialRegex = /^newmtl\s(.*)$/;
    const diffuseColorRegex = /^Kd\s(\S+)\s(\S+)\s(\S+)$/;
    const specularColorRegex = /^Ks\s(\S+)\s(\S+)\s(\S+)$/;
    const specularExponentRegex = /^Ns\s(\S+)$/;
    const opacityRegex = /d\s(\S+)/;
    const parseMtlFile = (mtlFileContent) => {
        const mtlDataLines = mtlFileContent.trim().split('\n');
        const materials = [];
        for (let lineIndex = 0; lineIndex < mtlDataLines.length; lineIndex++) {
            const line = mtlDataLines[lineIndex].trim();
            if (!line)
                continue;
            const materialMatch = line.match(newMaterialRegex);
            if (materialMatch) {
                const [, name] = materialMatch;
                materials.push({ name, diffuseColor: [1, 1, 1], specularColor: [1, 1, 1], specularExponent: 256, opacity: 1 });
            }
            const currentMaterial = materials[materials.length - 1];
            const diffuseColorMatch = line.match(diffuseColorRegex);
            if (diffuseColorMatch) {
                const [, r, g, b] = diffuseColorMatch;
                currentMaterial.diffuseColor = [toFloat(r), toFloat(g), toFloat(b)];
            }
            const specularColorMatch = line.match(specularColorRegex);
            if (specularColorMatch) {
                const [, r, g, b] = specularColorMatch;
                currentMaterial.specularColor = [toFloat(r), toFloat(g), toFloat(b)];
            }
            const specularExponentMatch = line.match(specularExponentRegex);
            if (specularExponentMatch) {
                const [, spec] = specularExponentMatch;
                currentMaterial.specularExponent = toFloat(spec);
            }
            const opacityMatch = line.match(opacityRegex);
            if (opacityMatch) {
                const [, opacity] = opacityMatch;
                currentMaterial.opacity = toFloat(opacity);
            }
        }
        return materials;
    };

    const createTrackballCameraControlSystem = ({ world, canvas }) => {
        const mouseInput = new MouseInput(canvas);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let camera = null;
        let lastMouseX = 0;
        let lastMouseY = 0;
        const mat4CacheX = glMatrix.mat4.create();
        const mat4CacheY = glMatrix.mat4.create();
        world.subscribe((action) => {
            if (action.type === 'ADD-ENTITY') {
                const perspectiveCamera = action.payload.getComponentByClass(PerspectiveCamera);
                if (perspectiveCamera) {
                    camera = perspectiveCamera;
                }
            }
        });
        return (delta) => {
            const mouseX = mouseInput.getMouseX();
            const mouseY = mouseInput.getMouseY();
            const movementX = (mouseX - lastMouseX) * delta;
            const movementY = (lastMouseY - mouseY) * delta;
            if (mouseInput.isButtonDown('PRIMARY')) {
                glMatrix.mat4.lookAt(camera.data.viewMatrix, camera.data.translation, [0, 0, 0], camera.data.upVector);
                glMatrix.mat4.rotateY(mat4CacheY, mat4CacheY, movementX);
                glMatrix.mat4.rotateX(mat4CacheX, mat4CacheX, -movementY);
                glMatrix.mat4.multiply(camera.data.viewMatrix, camera.data.viewMatrix, mat4CacheX);
                glMatrix.mat4.multiply(camera.data.viewMatrix, camera.data.viewMatrix, mat4CacheY);
                camera.setDirty(true);
            }
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        };
    };

    const defaultContextAttributeOptions = {
        premultipliedAlpha: false,
        alpha: false,
        powerPreference: 'high-performance',
        antialias: true,
        desynchronized: true,
    };
    const getWebgl2Context = (canvas, contextAttributeOptions) => {
        const gl = canvas.getContext('webgl2', Object.assign(Object.assign({}, defaultContextAttributeOptions), contextAttributeOptions || {}));
        if (!gl)
            throw new Error('cannot get webgl2 context');
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.colorMask(true, true, true, false);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        return gl;
    };
    const createWebgl2Shader = (gl, type, source) => {
        const shader = gl.createShader(type);
        if (!shader)
            throw new Error('could not create shader');
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success)
            return shader;
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error('could not create shader');
    };
    const createWebgl2Program = (gl, vertexShader, fragmentShader) => {
        const program = gl.createProgram();
        if (!program)
            throw new Error('could not create program');
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success)
            return program;
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error('could not create program');
    };
    const createWebgl2ArrayBuffer = (gl, data) => {
        const buffer = gl.createBuffer();
        if (!buffer)
            throw new Error('could not create array buffer');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    };
    const setupWebgl2VertexAttribPointer = (gl, location, bufferSize, type = gl.FLOAT, stride = 0, offset = 0) => {
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, bufferSize, type, false, stride, offset);
    };
    const createWebgl2ElementArrayBuffer = (gl, indices) => {
        const buffer = gl.createBuffer();
        if (!buffer)
            throw new Error('could not create element array buffer');
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        return buffer;
    };
    const createWebgl2VertexArray = (gl) => {
        const vao = gl.createVertexArray();
        if (!vao)
            throw new Error('could not create vertex array object');
        gl.bindVertexArray(vao);
        return vao;
    };
    const defaultGLSL300Config = {
        floatPrecision: 'highp',
        intPrecision: 'highp',
    };
    const GLSL300ATTRIBUTE = {
        POSITION: { name: 'position', type: 'vec3', location: 0 },
        UV: { name: 'uv', type: 'vec2', location: 1 },
        NORMAL: { name: 'normal', type: 'vec3', location: 2 },
    };
    const glsl300 = (config = {}) => (source, ...interpolations) => {
        const version = '#version 300 es';
        const floatPrecision = `precision ${config.floatPrecision || defaultGLSL300Config.floatPrecision} float;`;
        const intPrecision = `precision ${config.intPrecision || defaultGLSL300Config.intPrecision} int;`;
        const uniformLayoutDeclaration = 'layout(std140, column_major) uniform;';
        let header = `${version}\n\n${floatPrecision}\n${intPrecision}\n\n${uniformLayoutDeclaration}\n\n`;
        const attributeDeclarations = (config.attributes || []).reduce((accum, attr) => {
            accum += `layout(location = ${attr.location}) in ${attr.type} ${attr.name};\n`;
            return accum;
        }, '');
        const inDeclarations = (config.in || []).reduce((accum, declaration) => {
            accum += `in ${declaration.type} ${declaration.name};\n`;
            return accum;
        }, '');
        const outDeclarations = (config.out || []).reduce((accum, declaration) => {
            accum += `out ${declaration.type} ${declaration.name};\n`;
            return accum;
        }, '');
        if (attributeDeclarations)
            header += attributeDeclarations;
        if (inDeclarations)
            header += inDeclarations;
        if (outDeclarations)
            header += outDeclarations;
        const sourceCode = source.reduce((accum, chunk, idx) => {
            accum += `${chunk}${interpolations[idx] || ''}`;
            return accum;
        }, header);
        return {
            config,
            sourceCode,
        };
    };
    const createTexture2D = (gl, image, options) => {
        const texture = gl.createTexture();
        if (!texture)
            throw new Error('could not create texture');
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const defaultOptions = {
            level: 0,
            internalFormat: gl.RGBA,
            srcFormat: gl.RGBA,
            srcType: gl.UNSIGNED_BYTE,
            generateMipmaps: true,
        };
        const texOptions = Object.assign(Object.assign({}, defaultOptions), options);
        gl.texImage2D(gl.TEXTURE_2D, texOptions.level, texOptions.internalFormat, texOptions.srcFormat, texOptions.srcType, image);
        if (texOptions.generateMipmaps)
            gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    };
    // ==================================
    // Uniform Buffer
    // WTF is this shit?
    const fixupUniformBufferIssue = (uniformBufferNormalMatrix, normalMatrix) => {
        uniformBufferNormalMatrix[0] = normalMatrix[0];
        uniformBufferNormalMatrix[1] = normalMatrix[1];
        uniformBufferNormalMatrix[2] = normalMatrix[2];
        uniformBufferNormalMatrix[3] = 0;
        uniformBufferNormalMatrix[4] = normalMatrix[3];
        uniformBufferNormalMatrix[5] = normalMatrix[4];
        uniformBufferNormalMatrix[6] = normalMatrix[5];
        uniformBufferNormalMatrix[7] = 0;
        uniformBufferNormalMatrix[8] = normalMatrix[6];
        uniformBufferNormalMatrix[9] = normalMatrix[7];
        uniformBufferNormalMatrix[10] = normalMatrix[8];
        uniformBufferNormalMatrix[11] = 0;
    };
    class UBO {
        constructor(gl, blockName, binding, config) {
            this.views = {};
            this.mat3BufferLayoutFuckup = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.gl = gl;
            this.blockName = blockName;
            this.binding = binding;
            this.config = config;
        }
        bindToShaderProgram(shaderProgram) {
            const gl = this.gl;
            const blockIndex = gl.getUniformBlockIndex(shaderProgram, this.blockName);
            gl.uniformBlockBinding(shaderProgram, blockIndex, this.binding);
            if (!this.bufferData) {
                const blockSize = gl.getActiveUniformBlockParameter(shaderProgram, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
                this.bufferData = new ArrayBuffer(blockSize);
                const namesFromConfig = Object.keys(this.config);
                const uniformIndices = gl.getUniformIndices(shaderProgram, namesFromConfig);
                const uniformOffsets = gl.getActiveUniforms(shaderProgram, uniformIndices, gl.UNIFORM_OFFSET);
                if (!uniformOffsets)
                    throw new Error('invalid ubo config');
                this.views = namesFromConfig.reduce((accum, name, idx) => {
                    if (this.config[name].data.length === 9) {
                        accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], 12);
                        fixupUniformBufferIssue(this.mat3BufferLayoutFuckup, this.config[name].data);
                        accum[name].set(this.mat3BufferLayoutFuckup);
                    }
                    else {
                        accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], this.config[name].data.length);
                        accum[name].set(this.config[name].data);
                    }
                    return accum;
                }, {});
                this.webglBuffer = gl.createBuffer();
                gl.bindBuffer(gl.UNIFORM_BUFFER, this.webglBuffer);
                gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, gl.DYNAMIC_DRAW);
                gl.bindBufferBase(gl.UNIFORM_BUFFER, this.binding, this.webglBuffer);
            }
            return this;
        }
        bindBase() {
            const gl = this.gl;
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.binding, this.webglBuffer);
            return this;
        }
        setView(key, data) {
            if (this.config[key].data.length === 9) {
                fixupUniformBufferIssue(this.mat3BufferLayoutFuckup, data);
                this.views[key].set(this.mat3BufferLayoutFuckup);
            }
            else {
                this.views[key].set(data);
            }
            return this;
        }
        update() {
            const gl = this.gl;
            gl.bindBuffer(gl.UNIFORM_BUFFER, this.webglBuffer);
            gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, gl.DYNAMIC_DRAW);
            return this;
        }
        cleanup() {
            this.gl.deleteBuffer(this.webglBuffer);
            return this;
        }
    }

    const createVertexShaderSource = () => glsl300({
        attributes: [
            { name: 'position', type: 'vec3', location: 0 },
            { name: 'normal', type: 'vec3', location: 1 },
        ],
        out: [
            { name: 'vNormal', type: 'vec3' },
            { name: 'vPosition', type: 'vec3' },
        ],
    }) `
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;

    uniform mat4 modelMatrix;

    void main() {
        mat4 modelView = camera.viewMatrix * modelMatrix;
        mat3 normalMatrix = mat3(transpose(inverse(modelView)));
        vNormal = normalMatrix * normal;
        vPosition = vec3(modelMatrix * vec4(position, 1.0));
        gl_Position = camera.projectionMatrix * camera.viewMatrix * modelMatrix * vec4(position, 1.0);
    }
`;
    const createFragmentShaderSource = (maxDirLights) => glsl300({
        in: [
            { name: 'vNormal', type: 'vec3' },
            { name: 'vPosition', type: 'vec3' },
        ],
        out: [
            { name: 'fragColor', type: 'vec4' }
        ],
    }) `
    uniform CameraUniforms {
        vec3 translation;
        mat4 viewMatrix;
        mat4 projectionMatrix;
    } camera;

    struct DirLight {
        vec3 direction;
        vec3 diffuseColor;
        vec3 specularColor;
    };

    uniform LightUniforms {
        DirLight dirLights[${maxDirLights}];
    } lights;

    struct Material {
        float ambientIntensity;
        vec3 diffuseColor;
        vec3 specularColor;
        float specularExponent;
        float opacity;
    };

    uniform MaterialUniforms {
        Material material;
    };

    vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
        vec3 direction = normalize(light.direction);
        float diff = max(dot(normal, direction), 0.0);
        vec3 reflectDir = reflect(-direction, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.specularExponent);
        vec3 ambient  = material.diffuseColor * material.ambientIntensity;
        vec3 diffuse  = light.diffuseColor * diff * material.diffuseColor;
        vec3 specular = light.specularColor * spec * material.specularColor;
        return ambient + diffuse + specular;
    }

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(camera.translation - vPosition);
        vec3 result = vec3(0.0, 0.0, 0.0);

        for(int i = 0; i < ${maxDirLights}; i++) {
            result += CalcDirLight(lights.dirLights[i], normal, viewDir);
        }

        fragColor = vec4(result, 1.0);
    }
`;
    const cameraUboConfig = {
        'CameraUniforms.translation': { data: glMatrix.vec3.create() },
        'CameraUniforms.viewMatrix': { data: glMatrix.mat4.create() },
        'CameraUniforms.projectionMatrix': { data: glMatrix.mat4.create() },
    };
    const getLightsUboConfig = (maxLights) => [...new Array(maxLights)].map((_, idx) => idx).reduce((accum, idx) => {
        accum[`LightUniforms.dirLights[${idx}].direction`] = { data: glMatrix.vec3.create() };
        accum[`LightUniforms.dirLights[${idx}].diffuseColor`] = { data: glMatrix.vec3.create() };
        accum[`LightUniforms.dirLights[${idx}].specularColor`] = { data: glMatrix.vec3.create() };
        return accum;
    }, {});
    const materialUboConfig = {
        'material.ambientIntensity': { data: [0] },
        'material.diffuseColor': { data: glMatrix.vec3.create() },
        'material.specularColor': { data: glMatrix.vec3.create() },
        'material.specularExponent': { data: [0] },
        'material.opacity': { data: [1] },
    };
    const createWebgl2RenderingSystem = ({ world, canvas, maxDirectionalLights = 5 }) => {
        const gl = getWebgl2Context(canvas);
        const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, createVertexShaderSource().sourceCode);
        const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, createFragmentShaderSource(maxDirectionalLights).sourceCode);
        const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
        gl.useProgram(shaderProgram);
        const cache = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const cameraCache = {
            ubo: new UBO(gl, 'CameraUniforms', 0, cameraUboConfig),
        };
        const lightCache = {
            ubo: new UBO(gl, 'LightUniforms', 1, getLightsUboConfig(maxDirectionalLights)),
            dirLights: [],
        };
        world.subscribe((action) => {
            if (action.type === 'ADD-ENTITY') {
                const perspectiveCamera = action.payload.getComponentByClass(PerspectiveCamera);
                const directionalLight = action.payload.getComponentByClass(DirectionalLight);
                const transform = action.payload.getComponentByClass(Transform);
                const geometry = action.payload.getComponentByClass(Geometry);
                const phongMaterial = action.payload.getComponentByClass(PhongMaterial);
                if (perspectiveCamera) {
                    cameraCache.camera = perspectiveCamera;
                }
                else if (directionalLight) {
                    if (lightCache.dirLights.length > maxDirectionalLights) {
                        throw new Error('you cannot add another DirectionalLight, try to increase the maxDirectionalLights property');
                    }
                    lightCache.dirLights.push(directionalLight);
                }
                else if (transform && geometry && phongMaterial) {
                    const materialUbo = new UBO(gl, 'MaterialUniforms', 2, materialUboConfig);
                    cameraCache.ubo.bindToShaderProgram(shaderProgram);
                    lightCache.ubo.bindToShaderProgram(shaderProgram);
                    materialUbo.bindToShaderProgram(shaderProgram);
                    const vao = createWebgl2VertexArray(gl);
                    const positionBuffer = createWebgl2ArrayBuffer(gl, geometry.data.positions);
                    setupWebgl2VertexAttribPointer(gl, 0, 3);
                    const normalBuffer = createWebgl2ArrayBuffer(gl, geometry.data.normals);
                    setupWebgl2VertexAttribPointer(gl, 1, 3);
                    const indexBuffer = createWebgl2ElementArrayBuffer(gl, geometry.data.indices);
                    const indexCount = geometry.data.indices.length;
                    const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
                    gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                    cache.push({
                        update: () => {
                            materialUbo.bindBase();
                            if (phongMaterial.isDirty()) {
                                console.log('material update');
                                phongMaterial.setDirty(false);
                                materialUbo
                                    .setView('material.ambientIntensity', [phongMaterial.data.ambientIntensity])
                                    .setView('material.diffuseColor', phongMaterial.data.diffuseColor)
                                    .setView('material.specularColor', phongMaterial.data.specularColor)
                                    .setView('material.specularExponent', [phongMaterial.data.specularExponent])
                                    .setView('material.opacity', [phongMaterial.data.opacity])
                                    .update();
                            }
                            gl.uniformMatrix4fv(modelMatrixLocation, false, transform.data.modelMatrix);
                            gl.bindVertexArray(vao);
                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                            gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
                        },
                    });
                }
            }
        });
        window.addEventListener('resize', () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            cameraCache.camera.setAspect(canvas.width / canvas.height);
        });
        let lightNeedsUpdate = true;
        return () => {
            if (cameraCache.camera.isDirty()) {
                console.log('update camera ubo');
                cameraCache.ubo
                    .setView('CameraUniforms.translation', cameraCache.camera.data.translation)
                    .setView('CameraUniforms.viewMatrix', cameraCache.camera.data.viewMatrix)
                    .setView('CameraUniforms.projectionMatrix', cameraCache.camera.data.projectionMatrix)
                    .update();
            }
            for (let i = 0; i < lightCache.dirLights.length; i++) {
                const dirLight = lightCache.dirLights[i];
                if (dirLight.isDirty()) {
                    console.log(`light ${i} is dirty`);
                    lightNeedsUpdate = true;
                    lightCache.ubo
                        .setView(`LightUniforms.dirLights[${i}].direction`, dirLight.data.direction)
                        .setView(`LightUniforms.dirLights[${i}].diffuseColor`, dirLight.data.diffuseColor)
                        .setView(`LightUniforms.dirLights[${i}].specularColor`, dirLight.data.specularColor);
                }
            }
            if (lightNeedsUpdate) {
                console.log('update light ubo');
                lightCache.ubo.update();
                lightNeedsUpdate = false;
            }
            for (let i = 0; i < cache.length; i++) {
                cache[i].update();
            }
            cameraCache.camera.setDirty(false);
            for (let i = 0; i < lightCache.dirLights.length; i++) {
                lightCache.dirLights[i].setDirty(false);
            }
        };
    };

    const createMap = (in_min, in_max, out_min, out_max) => (value) => ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    };

    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    };
    const rgbToHex = (r, g, b) => '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);

    exports.BoundingBox = BoundingBox;
    exports.DEG_TO_RAD = DEG_TO_RAD;
    exports.DirectionalLight = DirectionalLight;
    exports.Entity = Entity;
    exports.FileLoader = FileLoader;
    exports.GLSL300ATTRIBUTE = GLSL300ATTRIBUTE;
    exports.Geometry = Geometry;
    exports.ImageLoader = ImageLoader;
    exports.KeyboardInput = KeyboardInput;
    exports.MouseInput = MouseInput;
    exports.PerspectiveCamera = PerspectiveCamera;
    exports.PhongMaterial = PhongMaterial;
    exports.RAD_TO_DEG = RAD_TO_DEG;
    exports.Transform = Transform;
    exports.UBO = UBO;
    exports.World = World;
    exports.boundingBoxBufferLayout = boundingBoxBufferLayout;
    exports.computeBoundingBox = computeBoundingBox;
    exports.createMap = createMap;
    exports.createObjFileParser = createObjFileParser;
    exports.createTexture2D = createTexture2D;
    exports.createTrackballCameraControlSystem = createTrackballCameraControlSystem;
    exports.createWebgl2ArrayBuffer = createWebgl2ArrayBuffer;
    exports.createWebgl2ElementArrayBuffer = createWebgl2ElementArrayBuffer;
    exports.createWebgl2Program = createWebgl2Program;
    exports.createWebgl2RenderingSystem = createWebgl2RenderingSystem;
    exports.createWebgl2Shader = createWebgl2Shader;
    exports.createWebgl2VertexArray = createWebgl2VertexArray;
    exports.defaultContextAttributeOptions = defaultContextAttributeOptions;
    exports.degreesToRadians = degreesToRadians;
    exports.getGeometryBufferLayout = getGeometryBufferLayout;
    exports.getLineGeometryFromBoundingBox = getLineGeometryFromBoundingBox;
    exports.getWebgl2Context = getWebgl2Context;
    exports.glsl300 = glsl300;
    exports.hexToRgb = hexToRgb;
    exports.intersection = intersection;
    exports.isSABSupported = isSABSupported;
    exports.parseMtlFile = parseMtlFile;
    exports.parseObjFile = parseObjFile;
    exports.radiansToDegrees = radiansToDegrees;
    exports.rgbToHex = rgbToHex;
    exports.setupWebgl2VertexAttribPointer = setupWebgl2VertexAttribPointer;
    exports.toFloat = toFloat;
    exports.toInt = toInt;
    exports.worldActions = worldActions;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
