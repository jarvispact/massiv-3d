import WebGLUtils from './webgl-utils';

class Uniform {
    constructor(gl, location, name, type) {
        this.gl = gl;
        this.location = location;
        this.name = name;
        this.value = null;

        const webglUniformTypeToUniformType = WebGLUtils.createUniformTypeLookupTable(gl);
        this.type = webglUniformTypeToUniformType[type];
    }

    update(newValue) {
        if (newValue === this.value) return;
        this.value = newValue;
        WebGLUtils.uniformTypeToUpdateUniformFunction[this.type](this.gl, this.location, this.value);
    }
}

export default Uniform;
