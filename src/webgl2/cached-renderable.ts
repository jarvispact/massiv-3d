import { mat4 } from 'gl-matrix';
import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Transform } from '../components/transform';
import { GeometryData } from '../geometry/geometry';
import { MaterialClass } from '../material/material';
import { PhongMaterial } from '../material/phong-material';
import { UnlitMaterial } from '../material/unlit-material';
import { WebGL2FrameState } from './webgl-2-frame-state';
import { ActiveUniform, createArrayBuffer, createElementArrayBuffer, createProgram, createShader, createVertexArray, getActiveAttributes, getActiveUniforms, UNIFORM, uniformTypeToUpdateUniformFunction } from './webgl-2-utils';

const getMaterialClass = (constructorName: string): MaterialClass => {
    switch (constructorName) {
        case 'UnlitMaterial':
            return UnlitMaterial;
        case 'PhongMaterial':
            return PhongMaterial;
        default:
            return UnlitMaterial;
    }
};

export class CachedRenderable {
    gl: WebGL2RenderingContext;
    renderable: Renderable;
    transform: Transform;
    frameState: WebGL2FrameState;
    
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    buffers: WebGLBuffer[];
    geometryData: GeometryData;
    indexBuffer: WebGLBuffer | null;

    activeUniforms: ActiveUniform[];

    constructor(gl: WebGL2RenderingContext, renderable: Renderable, transform: Transform, frameState: WebGL2FrameState) {
        this.gl = gl;
        this.renderable = renderable;
        this.transform = transform;
        this.frameState = frameState;

        const shaderSource = getMaterialClass(this.renderable.data.material.constructor.name).getShaderSourceCode();
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, shaderSource.vertexShader);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderSource.fragmentShader);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);

        const attribs = getActiveAttributes(gl, this.program);
        const attributeNames = attribs.map(a => a.name);
        this.buffers = [];

        this.vao = createVertexArray(gl);
        this.geometryData = renderable.data.geometry.getGeometryData();

        if (attributeNames.includes('position') && this.geometryData.positions) {
            this.buffers.push(createArrayBuffer(gl, Float32Array.from(this.geometryData.positions), 0, 3));
        }

        this.indexBuffer = this.geometryData.indices ? createElementArrayBuffer(gl, Uint32Array.from(this.geometryData.indices)) : null;
        this.activeUniforms = getActiveUniforms(gl, this.program);
    }

    render(camera: PerspectiveCamera | OrthographicCamera): void {
        const gl = this.gl;
        const transform = this.transform;
        const renderable = this.renderable;
        const frameState = this.frameState;
        const activeUniforms = this.activeUniforms;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // TODO: add to framestate and reset after each frame
        let modelViewComputed = false;

        for (let i = 0; i < activeUniforms.length; i++) {
            const uniform = activeUniforms[i];
            if (uniform.name === UNIFORM.MODEL_MATRIX && transform.data.webgl2UniformUpdateFlag.modelMatrix) {
                gl.uniformMatrix4fv(uniform.location, false, transform.data.modelMatrix);
            } else if (uniform.name === UNIFORM.VIEW_MATRIX && camera.data.webgl2UniformUpdateFlag.viewMatrix) {
                gl.uniformMatrix4fv(uniform.location, false, camera.data.viewMatrix);
            } else if (uniform.name === UNIFORM.PROJECTION_MATRIX && camera.data.webgl2UniformUpdateFlag.projectionMatrix) {
                gl.uniformMatrix4fv(uniform.location, false, camera.data.projectionMatrix);
            } else if (uniform.name === UNIFORM.MODEL_VIEW_MATRIX && (transform.data.webgl2UniformUpdateFlag.modelMatrix || camera.data.webgl2UniformUpdateFlag.viewMatrix)) {
                mat4.multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                modelViewComputed = true;
                gl.uniformMatrix4fv(uniform.location, false, camera.data.viewMatrix);
            } else if (uniform.name === UNIFORM.MODEL_VIEW_PROJECTION_MATRIX && (transform.data.webgl2UniformUpdateFlag.modelMatrix || camera.data.webgl2UniformUpdateFlag.viewMatrix || camera.data.webgl2UniformUpdateFlag.projectionMatrix)) {
                if (!modelViewComputed) mat4.multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                mat4.multiply(frameState.matrixCache.modelViewProjection, camera.data.projectionMatrix, frameState.matrixCache.modelView);
                gl.uniformMatrix4fv(uniform.location, false, frameState.matrixCache.modelViewProjection);
            } else if (uniform.name === UNIFORM.CAMERA_POSITION && camera.data.webgl2UniformUpdateFlag.translation) {
                gl.uniformMatrix3fv(uniform.location, false, camera.data.projectionMatrix);
            } else {
                const value = renderable.data.material.getUniformValue(uniform.name);
                if (value !== null) {
                    console.log(`update: ${uniform.name}`);
                    uniformTypeToUpdateUniformFunction[uniform.type](gl, uniform.location, value);
                }
            }
        }

        if (this.indexBuffer && this.geometryData.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.geometryData.indices.length, gl.UNSIGNED_INT, 0);
        } else {
            // TODO
        }
    }

    cleanup(): void {
        const gl = this.gl;
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        gl.deleteProgram(this.program);
        this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.indexBuffer);
    }
}