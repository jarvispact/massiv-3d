const UNIFORM_TYPES = {
    MAT4: 'mat4',
    MAT3: 'mat3',
    VEC3: 'vec3',
    FLOAT: 'float',
    INT: 'int',
};

class UniformBuffer {
    constructor(gl, location, uniformBlockName, names, types) {
        const webglUniformTypeToUniformType = {
            [gl.FLOAT_MAT4]: UNIFORM_TYPES.MAT4,
            [gl.FLOAT_MAT3]: UNIFORM_TYPES.MAT3,
            [gl.FLOAT_VEC3]: UNIFORM_TYPES.VEC3,
            [gl.FLOAT]: UNIFORM_TYPES.FLOAT,
            [gl.INT]: UNIFORM_TYPES.INT,
        };

        this.gl = gl;
        this.location = location;
        this.uniformBlockName = uniformBlockName;
        this.names = names;
        this.types = types.map(type => webglUniformTypeToUniformType[type]);
        this.values = {};
    }

    static get TYPES() {
        return UNIFORM_TYPES;
    }

    update(name, newValue) {
        if (newValue === this.values[name]) return;
        this.values[name] = newValue;
    }
}

export default UniformBuffer;
