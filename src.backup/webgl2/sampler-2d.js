import WebGL2Utils from './webgl-2-utils';

const Sampler2D = class {
    constructor(gl, name, location, texture) {
        this.gl = gl;
        this.name = name;
        this.location = location;
        this.texture = texture;
    }

    update(index) {
        this.gl.activeTexture(this.gl.TEXTURE0 + index);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        WebGL2Utils.uniformTypeToUpdateUniformFunction.sampler2D(this.gl, this.location, index);
    }
};

export default Sampler2D;
