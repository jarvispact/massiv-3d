class NormalMaterial {
    constructor(options = {}) {
        this.opacity = options.opacity || 1;

        this.uniformUpdate = {
            opacity: true,
        };
    }

    setOpacity(opacity) {
        this.opacity = opacity;
        this.uniformUpdate.opacity = true;
    }

    getUniformUpdateFlag(name) {
        return this.uniformUpdate[name];
    }

    markUniformsAsUpdated() {
        this.uniformUpdate.opacity = false;
    }
}

export default NormalMaterial;
