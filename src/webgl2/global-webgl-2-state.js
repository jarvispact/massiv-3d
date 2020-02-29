const GlobalWebGL2State = class {
    constructor(gl) {
        this.gl = gl;
        this.depthTestEnabled = true;
        this.depthFunc = gl.LEQUAL;

        this.blendEnabled = false;
        this.blendEquation = gl.FUNC_ADD;
        this.blendFuncSFactor = gl.SRC_ALPHA;
        this.blendFuncDFactor = gl.ONE_MINUS_SRC_ALPHA;

        gl.depthFunc(this.depthFunc);
        gl.blendEquation(this.blendEquation);
        gl.blendFunc(this.blendFuncSFactor, this.blendFuncDFactor);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }

    setDepthTestEnabled(flag) {
        if (this.depthTestEnabled === flag) return;
        this.depthTestEnabled = flag;
        console.log('setDepthTestEnabled', flag);
        if (flag) {
            this.gl.enable(this.gl.DEPTH_TEST);
        } else {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
    }

    setBlendEnabled(flag) {
        if (this.blendEnabled === flag) return;
        this.blendEnabled = flag;
        console.log('setBlendEnabled', flag);
        if (flag) {
            this.gl.enable(this.gl.BLEND);
        } else {
            this.gl.disable(this.gl.BLEND);
        }
    }
};

export default GlobalWebGL2State;
