import { vec3, vec2 } from 'gl-matrix';

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

const toFloat = (val) => Number.parseFloat(val);

const toInt = (val) => Number.parseInt(val, 10);

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const useMaterialRegex = /^usemtl\s(.*)$/;
const vertexPositionRegex = /^v\s+(\S+)\s(\S+)\s(\S+)$/;
const vertexUvRegex = /^vt\s+(\S+)\s(\S+).*$/;
const vertexNormalRegex = /^vn\s+(\S+)\s(\S+)\s(\S+)$/;
const triangleFaceRegex = /^f\s+(\S+)\s(\S+)\s(\S+)$/;
const quadFaceRegex = /^f\s+(\S+)\s(\S+)\s(\S+)\s(\S+)$/;
const vRegex = /^(\d{1,})$/;
const vnRegex = /^(\d{1,})\/\/(\d{1,})$/;
const vuRegex = /^(\d{1,})\/(\d{1,})$/;
const vnuRegex = /^(\d{1,})\/(\d{1,})\/(\d{1,})$/;
const correctIndex = (idx) => idx - 1;
const defaultConfig = {
    flipUvX: false,
    flipUvY: false,
    splitPrimitiveMode: 'object',
};
const createObjFileParser = (config) => {
    const cfg = config ? Object.assign(Object.assign({}, defaultConfig), config) : defaultConfig;
    const primitiveRegex = cfg.splitPrimitiveMode === 'object' ? /^o\s(.*)$/ : /^g\s(.*)$/;
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
                const [, _x, _y] = vertexUvMatch;
                const x = toFloat(_x);
                const y = toFloat(_y);
                allUvs.push([cfg.flipUvX ? 1 - x : x, cfg.flipUvY ? 1 - y : y]);
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
            const primitiveMatch = line.match(primitiveRegex);
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
const opacityRegex = /^d\s(\S+)$/;
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

const computeTangents = (positions, indices, uvs) => {
    const tangents = new Array(positions.length);
    const bitangents = new Array(positions.length);
    for (let i = 0; i < indices.length; i += 3) {
        const idx1 = indices[i + 0];
        const idx2 = indices[i + 1];
        const idx3 = indices[i + 2];
        const pp1 = positions.slice(idx1 * 3, idx1 * 3 + 3);
        const pp2 = positions.slice(idx2 * 3, idx2 * 3 + 3);
        const pp3 = positions.slice(idx3 * 3, idx3 * 3 + 3);
        const p1 = vec3.fromValues(pp1[0], pp1[1], pp1[2]);
        const p2 = vec3.fromValues(pp2[0], pp2[1], pp2[2]);
        const p3 = vec3.fromValues(pp3[0], pp3[1], pp3[2]);
        const uuv1 = uvs.slice(idx1 * 2, idx1 * 2 + 2);
        const uuv2 = uvs.slice(idx2 * 2, idx2 * 2 + 2);
        const uuv3 = uvs.slice(idx3 * 2, idx3 * 2 + 2);
        const uv1 = vec2.fromValues(uuv1[0], uuv1[1]);
        const uv2 = vec2.fromValues(uuv2[0], uuv2[1]);
        const uv3 = vec2.fromValues(uuv3[0], uuv3[1]);
        const deltaPos1 = vec3.create();
        const deltaPos2 = vec3.create();
        vec3.subtract(deltaPos1, p2, p1);
        vec3.subtract(deltaPos2, p3, p1);
        const deltaUv1 = vec2.create();
        const deltaUv2 = vec2.create();
        vec2.subtract(deltaUv1, uv2, uv1);
        vec2.subtract(deltaUv2, uv3, uv1);
        const r = 1 / (deltaUv1[0] * deltaUv2[1] - deltaUv1[1] * deltaUv2[0]);
        const tangent = vec3.create();
        const bitangent = vec3.create();
        const tmp1 = vec3.create();
        const tmp2 = vec3.create();
        vec3.subtract(tangent, vec3.scale(tmp1, deltaPos1, deltaUv2[1]), vec3.scale(tmp2, deltaPos2, deltaUv1[1]));
        vec3.scale(tangent, tangent, r);
        vec3.subtract(bitangent, vec3.scale(tmp1, deltaPos2, deltaUv1[0]), vec3.scale(tmp2, deltaPos1, deltaUv2[0]));
        vec3.scale(bitangent, bitangent, r);
        vec3.normalize(tangent, tangent);
        vec3.normalize(bitangent, bitangent);
        tangents[idx1 * 3] = tangent[0];
        tangents[idx1 * 3 + 1] = tangent[1];
        tangents[idx1 * 3 + 2] = tangent[2];
        tangents[idx2 * 3] = tangent[0];
        tangents[idx2 * 3 + 1] = tangent[1];
        tangents[idx2 * 3 + 2] = tangent[2];
        tangents[idx3 * 3] = tangent[0];
        tangents[idx3 * 3 + 1] = tangent[1];
        tangents[idx3 * 3 + 2] = tangent[2];
        bitangents[idx1 * 3] = bitangent[0];
        bitangents[idx1 * 3 + 1] = bitangent[1];
        bitangents[idx1 * 3 + 2] = bitangent[2];
        bitangents[idx2 * 3] = bitangent[0];
        bitangents[idx2 * 3 + 1] = bitangent[1];
        bitangents[idx2 * 3 + 2] = bitangent[2];
        bitangents[idx3 * 3] = bitangent[0];
        bitangents[idx3 * 3 + 1] = bitangent[1];
        bitangents[idx3 * 3 + 2] = bitangent[2];
    }
    return { tangents, bitangents };
};

const createMap = (in_min, in_max, out_min, out_max) => (value) => ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;

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
const createWebgl2ArrayBuffer = (gl, data, usage) => {
    const buffer = gl.createBuffer();
    if (!buffer)
        throw new Error('could not create array buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
    return buffer;
};
const updateWebgl2ArrayBuffer = (gl, buffer, data) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
};
const setupWebgl2VertexAttribPointer = (gl, location, bufferSize, type = gl.FLOAT, stride = 0, offset = 0) => {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, bufferSize, type, false, stride, offset);
};
const createWebgl2ElementArrayBuffer = (gl, indices, usage) => {
    const buffer = gl.createBuffer();
    if (!buffer)
        throw new Error('could not create element array buffer');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, usage || gl.STATIC_DRAW);
    return buffer;
};
const updateWebgl2ElementArrayBuffer = (gl, buffer, indices) => {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indices);
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
    TANGENT: { name: 'tangent', type: 'vec3', location: 3 },
    BITANGENT: { name: 'bitangent', type: 'vec3', location: 4 },
    COLOR: { name: 'color', type: 'vec3', location: 5 },
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
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
    };
    const texOptions = Object.assign(Object.assign({}, defaultOptions), options);
    gl.texImage2D(gl.TEXTURE_2D, texOptions.level, texOptions.internalFormat, texOptions.srcFormat, texOptions.srcType, image);
    if (texOptions.generateMipmaps)
        gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texOptions.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texOptions.wrapT);
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
        this.arrayCache = [0];
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
                if (typeof this.config[name] === 'number') {
                    this.arrayCache[0] = this.config[name];
                    accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], 1);
                    accum[name].set(this.arrayCache);
                }
                else if (this.config[name].length === 9) {
                    accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], 12);
                    fixupUniformBufferIssue(this.mat3BufferLayoutFuckup, this.config[name]);
                    accum[name].set(this.mat3BufferLayoutFuckup);
                }
                else {
                    accum[name] = new Float32Array(this.bufferData, uniformOffsets[idx], this.config[name].length);
                    accum[name].set(this.config[name]);
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
    setMat4(key, data) {
        this.views[key].set(data);
        return this;
    }
    setMat3(key, data) {
        fixupUniformBufferIssue(this.mat3BufferLayoutFuckup, data);
        this.views[key].set(this.mat3BufferLayoutFuckup);
        return this;
    }
    setVec4(key, data) {
        this.views[key].set(data);
        return this;
    }
    setVec3(key, data) {
        this.views[key].set(data);
        return this;
    }
    setVec2(key, data) {
        this.views[key].set(data);
        return this;
    }
    setScalar(key, data) {
        this.arrayCache[0] = data;
        this.views[key].set(this.arrayCache);
        return this;
    }
    update() {
        const gl = this.gl;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.webglBuffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.bufferData);
        return this;
    }
    cleanup() {
        this.gl.deleteBuffer(this.webglBuffer);
        return this;
    }
}

export { DEG_TO_RAD, Entity, FileLoader, GLSL300ATTRIBUTE, ImageLoader, KeyboardInput, MouseInput, RAD_TO_DEG, UBO, World, computeTangents, createMap, createObjFileParser, createTexture2D, createWebgl2ArrayBuffer, createWebgl2ElementArrayBuffer, createWebgl2Program, createWebgl2Shader, createWebgl2VertexArray, defaultContextAttributeOptions, degreesToRadians, getWebgl2Context, glsl300, intersection, parseMtlFile, parseObjFile, radiansToDegrees, setupWebgl2VertexAttribPointer, toFloat, toInt, updateWebgl2ArrayBuffer, updateWebgl2ElementArrayBuffer, worldActions };
