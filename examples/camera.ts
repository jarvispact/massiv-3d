import { mat4, vec3 } from 'gl-matrix';
import { UBO } from '../src';

export const createPerspectiveCamera = (gl: WebGL2RenderingContext, t: vec3, aspect: number) => {
    const upVector: vec3 = [0, 1, 0];
    let translation = vec3.copy(vec3.create(), t);
    const lookAt: vec3 = [0, 0, 0];
    let viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.lookAt(viewMatrix, translation, lookAt, upVector);
    mat4.perspective(projectionMatrix, 45, aspect, 0.1, 1000);
    
    const ubo = new UBO(gl, 'CameraUniforms', 0, {
        'CameraUniforms.translation': { data: translation },
        'CameraUniforms.viewMatrix': { data: viewMatrix },
        'CameraUniforms.projectionMatrix': { data: projectionMatrix },
    });

    const getTranslation = () => {
        return translation;
    };

    const getLookAt = () => {
        return lookAt;
    };

    const getUpVector = () => {
        return upVector;
    };

    const setAspect = (newAspect: number) => {
        mat4.perspective(projectionMatrix, 45, newAspect, 0.1, 1000);
        ubo.setView('CameraUniforms.projectionMatrix', projectionMatrix).update();
    };

    const setViewMatrix = (newViewMatrix: mat4) => {
        viewMatrix = newViewMatrix;
        ubo.setView('CameraUniforms.viewMatrix', viewMatrix).update();
    };

    const update = (newTranslation: vec3) => {
        translation = newTranslation;
        mat4.lookAt(viewMatrix, translation, lookAt, upVector);
        ubo.setView('CameraUniforms.viewMatrix', viewMatrix).setView('CameraUniforms.translation', translation).update();
    };

    const bindToShaderProgram = (shaderProgram: WebGLProgram) => {
        ubo.bindToShaderProgram(shaderProgram);
    };

    return {
        getTranslation,
        getLookAt,
        getUpVector,
        setAspect,
        setViewMatrix,
        update,
        bindToShaderProgram
    }
};