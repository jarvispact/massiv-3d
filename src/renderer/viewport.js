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

export default Viewport;
