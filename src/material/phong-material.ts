import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';

type Args = {
    ambientIntensity?: number;
    diffuseColor?: vec3;
    specularColor?: vec3;
    specularShininess?: number;
    opacity?: number;
};

export class PhongMaterial implements Material {
    static getShaderSourceCode: () => ShaderSourceCode;
    ambientIntensity: number;
    diffuseColor: vec3;
    specularColor: vec3;
    specularShininess: number;
    opacity: number;
    dirty: {
        ambientIntensity: boolean;
        diffuseColor: boolean;
        specularColor: boolean;
        specularShininess: boolean;
        opacity: boolean;
    };

    constructor(args: Args = {}) {
        this.ambientIntensity = args.ambientIntensity || 0.1;
        this.diffuseColor = args.diffuseColor || [1, 0, 0];
        this.specularColor = args.specularColor || [1, 1, 1];
        this.specularShininess = args.specularShininess || 256;
        this.opacity = args.opacity || 1;
        this.dirty = {
            ambientIntensity: true,
            diffuseColor: true,
            specularColor: true,
            specularShininess: true,
            opacity: true,
        };
    }

    getUniformValue(uniformName: string): unknown | null {
        const name = uniformName as keyof PhongMaterial['dirty'];
        if (!this.dirty[name]) return null;
        this.dirty[name] = false;
        return this[name];
    }
}

const vertexShader = `
    #version 300 es
    precision highp float;
    precision highp int;
    layout(location = 0) in vec3 position;
    uniform mat4 modelViewProjectionMatrix;
    void main() {
        gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);
    }
`.trim();

const fragmentShader = `
    #version 300 es
    precision highp float;
    precision highp int;
    uniform vec3 color;
    uniform float opacity;
    out vec4 fragmentColor;
    void main() {
        fragmentColor = vec4(color, opacity);
    }
`.trim();

PhongMaterial.getShaderSourceCode = (): ShaderSourceCode => ({
    vertexShader,
    fragmentShader,
});