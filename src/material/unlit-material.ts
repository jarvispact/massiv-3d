import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';

type Args = {
    color?: vec3;
    opacity?: number;
};

export class UnlitMaterial implements Material {
    static getShaderSourceCode: () => ShaderSourceCode;
    color: vec3;
    opacity: number;
    dirty: {
        color: boolean;
        opacity: boolean;
    };

    constructor(args: Args = {}) {
        this.color = args.color || [1, 1, 1];
        this.opacity = args.opacity || 1;
        this.dirty = {
            color: true,
            opacity: true,
        };
    }

    getUniformValue(uniformName: string): unknown | null {
        const name = uniformName as keyof UnlitMaterial['dirty'];
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

UnlitMaterial.getShaderSourceCode = (): ShaderSourceCode => ({
    vertexShader,
    fragmentShader,
});