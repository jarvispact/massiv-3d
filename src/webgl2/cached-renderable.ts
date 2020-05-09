import { mat4, mat3, vec2, vec3, vec4 } from 'gl-matrix';
import { OrthographicCamera } from '../components/orthographic-camera';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Renderable } from '../components/renderable';
import { Transform } from '../components/transform';
import { GeometryData } from '../geometry/geometry';
import { MaterialClass } from '../material/material';
import { PhongMaterial } from '../material/phong-material';
import { UnlitMaterial } from '../material/unlit-material';
import { WebGL2FrameState } from './webgl-2-frame-state';
import { ActiveUniform, createArrayBuffer, createElementArrayBuffer, createProgram, createShader, createVertexArray, getActiveAttributes, getActiveUniforms, UNIFORM, WEBGL2_DATA_TYPE, ATTRIBUTE } from './webgl-2-utils';
import { DirectionalLight } from '../components/directional-light';

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

const UNIFORM_DIR_LIGHT_DIRECTION = `${UNIFORM.DIR_LIGHT_DIRECTION}[0]`;
const UNIFORM_DIR_LIGHT_COLOR = `${UNIFORM.DIR_LIGHT_COLOR}[0]`;
const UNIFORM_DIR_LIGHT_INTENSITY = `${UNIFORM.DIR_LIGHT_INTENSITY}[0]`;

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

    forceUniformUpdate: boolean;

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
        this.geometryData = renderable.data.geometry.getData();

        if (attributeNames.includes('position') && this.geometryData.positions) {
            this.buffers.push(createArrayBuffer(gl, Float32Array.from(this.geometryData.positions), ATTRIBUTE.POSITION.LOCATION, 3));
        }
        if (attributeNames.includes('normal') && this.geometryData.normals) {
            this.buffers.push(createArrayBuffer(gl, Float32Array.from(this.geometryData.normals), ATTRIBUTE.NORMAL.LOCATION, 3));
        }

        this.indexBuffer = this.geometryData.indices ? createElementArrayBuffer(gl, Uint32Array.from(this.geometryData.indices)) : null;
        this.activeUniforms = getActiveUniforms(gl, this.program);

        this.forceUniformUpdate = true;
    }

    render(camera: PerspectiveCamera | OrthographicCamera, dirLights: DirectionalLight[]): void {
        const gl = this.gl;
        const transform = this.transform;
        const renderable = this.renderable;
        const frameState = this.frameState;
        const activeUniforms = this.activeUniforms;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        let modelViewMatrixComputed = false;

        for (let i = 0; i < activeUniforms.length; i++) {
            const uniform = activeUniforms[i];
            
            if (uniform.name === UNIFORM.MODEL_MATRIX && transform.data.webglDirty.modelMatrix) {
                gl.uniformMatrix4fv(uniform.location, false, transform.data.modelMatrix);
            }
            else if (uniform.name === UNIFORM.VIEW_MATRIX && (this.forceUniformUpdate || camera.data.webglDirty.viewMatrix)) {
                gl.uniformMatrix4fv(uniform.location, false, camera.data.viewMatrix);
            }
            else if (uniform.name === UNIFORM.PROJECTION_MATRIX && (this.forceUniformUpdate || camera.data.webglDirty.projectionMatrix)) {
                gl.uniformMatrix4fv(uniform.location, false, camera.data.projectionMatrix);
            }
            else if (uniform.name === UNIFORM.MODEL_VIEW_MATRIX && (transform.data.webglDirty.modelMatrix || camera.data.webglDirty.viewMatrix)) {
                if (!modelViewMatrixComputed) mat4.multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                modelViewMatrixComputed = true;
                gl.uniformMatrix4fv(uniform.location, false, frameState.matrixCache.modelView);
            }
            else if (uniform.name === UNIFORM.MODEL_VIEW_PROJECTION_MATRIX && (transform.data.webglDirty.modelMatrix || camera.data.webglDirty.viewMatrix || camera.data.webglDirty.projectionMatrix)) {
                if (!modelViewMatrixComputed) mat4.multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                mat4.multiply(frameState.matrixCache.modelViewProjection, camera.data.projectionMatrix, frameState.matrixCache.modelView);
                gl.uniformMatrix4fv(uniform.location, false, frameState.matrixCache.modelViewProjection);
            }
            else if (uniform.name === UNIFORM.NORMAL_MATRIX && (this.forceUniformUpdate || transform.data.webglDirty.modelMatrix || camera.data.webglDirty.viewMatrix)) {
                if (!modelViewMatrixComputed) mat4.multiply(frameState.matrixCache.modelView, camera.data.viewMatrix, transform.data.modelMatrix);
                mat3.normalFromMat4(frameState.matrixCache.normal, frameState.matrixCache.modelView);
                gl.uniformMatrix3fv(uniform.location, false, frameState.matrixCache.normal);
            }
            else if (uniform.name === UNIFORM.CAMERA_POSITION && (this.forceUniformUpdate || camera.data.webglDirty.translation)) {
                gl.uniform3fv(uniform.location, camera.data.translation);
            }
            else if (uniform.name === UNIFORM.DIR_LIGHT_COUNT && (this.forceUniformUpdate || frameState.dirLightCache.countNeedsUpdate)) {
                gl.uniform1i(uniform.location, dirLights.length);
            }
            else if (uniform.name === UNIFORM_DIR_LIGHT_DIRECTION && (this.forceUniformUpdate || frameState.dirLightCache.directionsNeedsUpdate)) {
                gl.uniform3fv(uniform.location, frameState.dirLightCache.directions);
            }
            else if (uniform.name === UNIFORM_DIR_LIGHT_COLOR && (this.forceUniformUpdate || frameState.dirLightCache.colorsNeedsUpdate)) {
                gl.uniform3fv(uniform.location, frameState.dirLightCache.colors);
            }
            else if (uniform.name === UNIFORM_DIR_LIGHT_INTENSITY && (this.forceUniformUpdate || frameState.dirLightCache.intensitiesNeedsUpdate)) {
                gl.uniform1fv(uniform.location, frameState.dirLightCache.intensities);
            }
            else {
                const value = renderable.data.material.getUniformValue(uniform.name);
                if (value !== null) {                    
                    if (uniform.type === WEBGL2_DATA_TYPE.MAT3) {
                        gl.uniformMatrix3fv(uniform.location, false, value as mat3);
                    } else if (uniform.type === WEBGL2_DATA_TYPE.MAT4) {
                        gl.uniformMatrix4fv(uniform.location, false, value as mat4);
                    } else if (uniform.type === WEBGL2_DATA_TYPE.VEC2) {
                        gl.uniform2fv(uniform.location, value as vec2);
                    } else if (uniform.type === WEBGL2_DATA_TYPE.VEC3) {
                        gl.uniform3fv(uniform.location, value as vec3);
                    } else if (uniform.type === WEBGL2_DATA_TYPE.VEC4) {
                        gl.uniform4fv(uniform.location, value as vec4);
                    } else if (uniform.type === WEBGL2_DATA_TYPE.FLOAT) {
                        gl.uniform1f(uniform.location, value as number);
                    } else if (uniform.type === WEBGL2_DATA_TYPE.INT) {
                        gl.uniform1i(uniform.location, value as number);
                    }
                }
            }
        }

        if (this.indexBuffer && this.geometryData.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.geometryData.indices.length, gl.UNSIGNED_INT, 0);
        } else if (this.geometryData.positions) {
            gl.drawArrays(gl.TRIANGLES, 0, this.geometryData.positions.length / 3);
        }

        this.forceUniformUpdate = false;
        transform.resetWebglDirtyFlags();
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