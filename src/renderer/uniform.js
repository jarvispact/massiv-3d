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

export default Uniform;
