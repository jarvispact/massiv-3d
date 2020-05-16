import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';
import { UNIFORM as U } from '../webgl2/webgl-2-utils';

const getVertexShader = (): string => `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = 0) in vec3 position;

    uniform mat4 ${U.MODEL_VIEW_PROJECTION_MATRIX};

    void main() {
        gl_Position = ${U.MODEL_VIEW_PROJECTION_MATRIX} * vec4(position, 1.0);
    }
`.trim();

const getFragmentShader = (): string => `
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

type Args = {
    color?: vec3;
    opacity?: number;
};

export class UnlitMaterial implements Material {
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
        if (!this.dirty[uniformName as keyof UnlitMaterial['dirty']]) return null;
        this.dirty[uniformName as keyof UnlitMaterial['dirty']] = false;
        return this[uniformName as keyof UnlitMaterial['dirty']];
    }

    getTexture(): WebGLTexture | null {
        return null;
    }

    getShaderSourceCode(): ShaderSourceCode {
        return {
            vertexShader: getVertexShader(),
            fragmentShader: getFragmentShader(),
        };
    }

    setColor(r: number, g: number, b: number): void {
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;
        this.dirty.color = true;
    }

    setOpacity(opacity: number): void {
        this.opacity = opacity;
        this.dirty.opacity = true;
    }
}
