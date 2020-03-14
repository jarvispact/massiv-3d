import WebGL2Utils from './webgl-2-utils';
import ShaderRegistry from './shader-registry';
import Uniform from './uniform';
import Sampler2D from './sampler-2d';

const CachedRenderable = class {
    constructor(gl, id, renderable, transform, uniformUpdateLookupTable) {
        this.gl = gl;
        this.id = id;
        this.renderable = renderable;
        this.transform = transform;
        this.uniformUpdateLookupTable = uniformUpdateLookupTable;
        this.uniformUpdateLookupTable.forceUpdate();

        const vertexShaderSource = ShaderRegistry.getVertexShader(renderable);
        const fragmentShaderSource = ShaderRegistry.getFragmentShader(renderable);

        this.vertexShader = WebGL2Utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        this.fragmentShader = WebGL2Utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = WebGL2Utils.createProgram(gl, this.vertexShader, this.fragmentShader);

        this.webglUniformTypeToUniformType = WebGL2Utils.createUniformTypeLookupTable(this.gl);

        const activeAttributesCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        const attribs = [];

        for (let i = 0; i < activeAttributesCount; i++) {
            const attributeInfo = this.gl.getActiveAttrib(this.program, i);
            // const type = this.webglUniformTypeToUniformType[attributeInfo.type];
            attribs.push(attributeInfo.name);
        }

        const result = WebGL2Utils.createVertexArray(gl, renderable.geometry, attribs);
        this.positionBuffer = result.positionBuffer;
        this.uvBuffer = result.uvBuffer;
        this.normalBuffer = result.normalBuffer;
        this.colorBuffer = result.colorBuffer;
        this.vao = result.vertexArray;

        this.indices = WebGL2Utils.createElementArrayBuffer(gl, renderable.geometry);

        this.sampler2Ds = [];
        this.uniforms = [];

        const activeUniformsCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < activeUniformsCount; i++) {
            const uniformInfo = this.gl.getActiveUniform(this.program, i);
            const type = this.webglUniformTypeToUniformType[uniformInfo.type];
            const location = this.gl.getUniformLocation(this.program, uniformInfo.name);
            if (type === 'sampler2D') {
                const texture = WebGL2Utils.createTexture(this.gl, renderable.material[uniformInfo.name]);
                const sampler = new Sampler2D(this.gl, uniformInfo.name, location, texture);
                this.sampler2Ds.push(sampler);
            } else {
                const u = new Uniform(this.gl, uniformInfo.name, type, location, this.uniformUpdateLookupTable);
                this.uniforms.push(u);
            }
        }
    }

    render(camera, dirLights) {
        const gl = this.gl;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        let textureIndex = 0;

        for (let i = 0; i < this.sampler2Ds.length; i++) {
            const sampler = this.sampler2Ds[i];
            sampler.update(textureIndex);
            textureIndex++;
        }

        for (let i = 0; i < this.uniforms.length; i++) {
            const uniform = this.uniforms[i];
            uniform.updateValue(this.renderable, this.transform, camera, dirLights);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
        gl.drawElements(gl.TRIANGLES, this.renderable.geometry.indices.length, gl.UNSIGNED_INT, 0);
        this.uniformUpdateLookupTable.markRenderableAsUpdated(this.renderable, this.transform);
    }

    cleanup() {
        this.gl.deleteShader(this.vertexShader);
        this.gl.deleteShader(this.fragmentShader);
        this.gl.deleteProgram(this.program);
        if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
        if (this.uvBuffer) this.gl.deleteBuffer(this.uvBuffer);
        if (this.normalBuffer) this.gl.deleteBuffer(this.normalBuffer);
        if (this.colorBuffer) this.gl.deleteBuffer(this.colorBuffer);
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.indices);
    }
};

export default CachedRenderable;
