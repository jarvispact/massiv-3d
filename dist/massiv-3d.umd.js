(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('gl-matrix')) :
    typeof define === 'function' && define.amd ? define(['exports', 'gl-matrix'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MASSIV = {}, global.glMatrix));
}(this, (function (exports, glMatrix) { 'use strict';

    class Component {
        constructor(type, data) {
            this.type = type;
            this.data = data;
        }
    }

    // TODO: maybe a Record is better than a Array (faster access and less memory footprint)
    const hasMoreThanOneComponentsOfSameType = (componentTypes) => [...new Set(componentTypes)].length < componentTypes.length;
    class Entity {
        constructor(name, components) {
            this.name = name;
            this.components = components;
            this.componentTypes = components.map(c => c.type);
            if (hasMoreThanOneComponentsOfSameType(this.componentTypes)) {
                throw new Error('a entity can only one component of any type');
            }
        }
        addComponent(component) {
            this.components.push(component);
            this.componentTypes.push(component.type);
            if (hasMoreThanOneComponentsOfSameType(this.componentTypes)) {
                throw new Error('a entity can only one component of any type');
            }
            return this;
        }
        removeComponent(component) {
            this.components = this.components.filter(c => c !== component);
            this.componentTypes = this.componentTypes.filter(c => c !== component.type);
            return this;
        }
        removeComponentByType(type) {
            this.components = this.components.filter(c => c.type !== type);
            this.componentTypes = this.componentTypes.filter(c => c !== type);
            return this;
        }
        getComponent(klass) {
            return this.components.find(c => c.constructor.name === klass.name);
        }
    }

    const intersection = (list1, list2) => list1.filter(x => list2.includes(x));

    const createGetDelta = (then = 0) => (now) => {
        now *= 0.001;
        const delta = now - then;
        then = now;
        return delta;
    };
    class World {
        constructor() {
            this.getDelta = createGetDelta();
            this.entities = [];
            this.systems = [];
            this.queryCache = [];
        }
        addEntity(entity) {
            this.entities.push(entity);
            return this;
        }
        removeEntity(entity) {
            this.entities = this.entities.filter(e => e !== entity);
            return this;
        }
        removeEntityByName(entityName) {
            this.entities = this.entities.filter(e => e.name !== entityName);
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
                if (intersection(requiredComponents, entity.componentTypes).length === requiredComponents.length) {
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
    }

    const BUTTON = {
        PRIMARY: 0,
        AUXILIARY: 1,
        SECONDARY: 2,
    };
    class MouseInput {
        constructor(canvas) {
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
            const mouseDownHandler = (event) => {
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
            this.canvas.addEventListener('mousedown', mouseDownHandler);
            this.canvas.addEventListener('mousemove', mouseMoveHandler);
            this.canvas.addEventListener('mouseup', mouseUpHandler);
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
    const parseObjFile = (objFileContent, materials = []) => {
        const objDataLines = objFileContent.trim().split('\n');
        const cache = [];
        let indexCounter = 0;
        const allPositions = [];
        const allUvs = [];
        const allNormals = [];
        const primitives = [];
        const do_v_vertex = (primitive, p_index) => {
            const cached = cache.find(v => v.p === p_index);
            if (cached) {
                primitive.indices.push(cached.i);
            }
            else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.indices.push(indexCounter);
                cache.push({ p: p_index, i: indexCounter });
                indexCounter += 1;
            }
        };
        const do_vu_vertex = (primitive, p_index, u_index) => {
            const cached = cache.find(v => v.p === p_index && v.u === u_index);
            if (cached) {
                primitive.indices.push(cached.i);
            }
            else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.uvs.push(...[...allUvs[u_index]]);
                primitive.indices.push(indexCounter);
                cache.push({ p: p_index, u: u_index, i: indexCounter });
                indexCounter += 1;
            }
        };
        const do_vn_vertex = (primitive, p_index, n_index) => {
            const cached = cache.find(v => v.p === p_index && v.n === n_index);
            if (cached) {
                primitive.indices.push(cached.i);
            }
            else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.normals.push(...[...allNormals[n_index]]);
                primitive.indices.push(indexCounter);
                cache.push({ p: p_index, n: n_index, i: indexCounter });
                indexCounter += 1;
            }
        };
        const do_vnu_vertex = (primitive, p_index, u_index, n_index) => {
            const cached = cache.find(v => v.p === p_index && v.u === u_index && v.n === n_index);
            if (cached) {
                primitive.indices.push(cached.i);
            }
            else {
                primitive.positions.push(...[...allPositions[p_index]]);
                primitive.uvs.push(...[...allUvs[u_index]]);
                primitive.normals.push(...[...allNormals[n_index]]);
                primitive.indices.push(indexCounter);
                cache.push({ p: p_index, u: u_index, n: n_index, i: indexCounter });
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
                allUvs.push([toFloat(x), toFloat(y)]);
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
                    primitives.push({ name: `${currentPrimitive.name}.MULTIMATERIAL.${currentMaterialIndex}`, positions: [], uvs: [], normals: [], indices: [], materialIndex: currentMaterialIndex });
                    indexCounter = 0;
                }
            }
            // ==============================================
            // ensure we are working on the correct primitive
            const primitiveMatch = line.match(objectRegex);
            if (primitiveMatch) {
                const [, name] = primitiveMatch;
                primitives.push({ name, positions: [], uvs: [], normals: [], indices: [], materialIndex: -1 });
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
                }
            }
        }
        return primitives;
    };

    const newMaterialRegex = /^newmtl\s(.*)$/;
    const ambientColorRegex = /^Ka\s(\S+)\s(\S+)\s(\S+)$/;
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
                materials.push({ name, ambientColor: [0.1, 0.1, 0.1], diffuseColor: [1, 1, 1], specularColor: [1, 1, 1], specularExponent: 512, opacity: 1 });
            }
            const currentMaterial = materials[materials.length - 1];
            const ambientColorMatch = line.match(ambientColorRegex);
            if (ambientColorMatch) {
                const [, r, g, b] = ambientColorMatch;
                currentMaterial.ambientColor = [toFloat(r), toFloat(g), toFloat(b)];
            }
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

    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;
    const degreesToRadians = (degrees) => degrees * DEG_TO_RAD;
    const radiansToDegrees = (radians) => radians * RAD_TO_DEG;

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

    glMatrix.glMatrix.setMatrixArrayType(Array);

    exports.Component = Component;
    exports.DEG_TO_RAD = DEG_TO_RAD;
    exports.Entity = Entity;
    exports.FileLoader = FileLoader;
    exports.ImageLoader = ImageLoader;
    exports.KeyboardInput = KeyboardInput;
    exports.MouseInput = MouseInput;
    exports.RAD_TO_DEG = RAD_TO_DEG;
    exports.UBO = UBO;
    exports.World = World;
    exports.createTexture2D = createTexture2D;
    exports.createWebgl2ArrayBuffer = createWebgl2ArrayBuffer;
    exports.createWebgl2ElementArrayBuffer = createWebgl2ElementArrayBuffer;
    exports.createWebgl2Program = createWebgl2Program;
    exports.createWebgl2Shader = createWebgl2Shader;
    exports.createWebgl2VertexArray = createWebgl2VertexArray;
    exports.defaultContextAttributeOptions = defaultContextAttributeOptions;
    exports.degreesToRadians = degreesToRadians;
    exports.getWebgl2Context = getWebgl2Context;
    exports.glsl300 = glsl300;
    exports.intersection = intersection;
    exports.parseMtlFile = parseMtlFile;
    exports.parseObjFile = parseObjFile;
    exports.radiansToDegrees = radiansToDegrees;
    exports.setupWebgl2VertexAttribPointer = setupWebgl2VertexAttribPointer;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
