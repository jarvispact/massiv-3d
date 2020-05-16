/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode, ShaderSourceArgs } from './material';
import { UNIFORM as U, ATTRIBUTE as A, createTexture2D } from '../webgl2/webgl-2-utils';
import { Nullable } from '../types';

type FragmentShaderArgs = {
    useDiffuseMap: boolean;
    useSpecularMap: boolean;
};

const calcDirLight = `
    vec3 CalcDirLight(vec3 lDir, vec3 lDiffuse, float lIntensity, vec3 normal, vec3 viewDir, vec3 diffuseColor, vec3 specularColor) {
        vec3 direction = normalize(lDir);
        float diff = max(dot(normal, direction), 0.0);
        vec3 reflectDir = reflect(-direction, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
        vec3 ambient  = diffuseColor * ambientIntensity;
        vec3 diffuse  = lDiffuse * diff * diffuseColor * lIntensity;
        vec3 specular = lDiffuse * spec * specularColor * lIntensity;
        return ambient + diffuse + specular;
    }
`;

const getVertexShader = (): string => `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = ${A.POSITION.LOCATION}) in vec3 ${A.POSITION.NAME};
    layout(location = ${A.UV.LOCATION}) in vec2 ${A.UV.NAME};
    layout(location = ${A.NORMAL.LOCATION}) in vec3 ${A.NORMAL.NAME};

    uniform mat4 ${U.MODEL_MATRIX};
    uniform mat4 ${U.MODEL_VIEW_MATRIX};
    uniform mat3 ${U.NORMAL_MATRIX};
    uniform mat4 ${U.PROJECTION_MATRIX};

    out vec3 vPosition;
    out vec2 vUv;
    out vec3 vNormal;

    void main() {
        vUv = ${A.UV.NAME};
        vNormal = ${U.NORMAL_MATRIX} * normal;
        vPosition = vec3(${U.MODEL_MATRIX} * vec4(${A.POSITION.NAME}, 1.0));
        gl_Position = ${U.PROJECTION_MATRIX} * ${U.MODEL_VIEW_MATRIX} * vec4(${A.POSITION.NAME}, 1.0);
    }
`.trim();

const getFragmentShader = (args: FragmentShaderArgs): string => {
    const diffuseDeclaration = args.useDiffuseMap ? 'uniform sampler2D diffuseMap;' : 'uniform vec3 diffuseColor;';
    const specularDeclaration = args.useSpecularMap ? 'uniform sampler2D specularMap;' : 'uniform vec3 specularColor;';
    const diffuseTexelColor = args.useDiffuseMap ? 'vec3 diffuseColor = texture(diffuseMap, vUv).xyz;' : '';
    const specularTexelColor = args.useSpecularMap ? 'vec3 specularColor = texture(specularMap, vUv).xyz;' : '';

    return `
        #version 300 es

        precision highp float;
        precision highp int;

        const int maxDirLights = 5;

        uniform int ${U.DIR_LIGHT_COUNT};
        uniform vec3 ${U.DIR_LIGHT_DIRECTION}[maxDirLights];
        uniform vec3 ${U.DIR_LIGHT_COLOR}[maxDirLights];
        uniform float ${U.DIR_LIGHT_INTENSITY}[maxDirLights];

        uniform vec3 ${U.CAMERA_POSITION};

        uniform float ambientIntensity;
        ${diffuseDeclaration}
        ${specularDeclaration}
        uniform float specularShininess;
        uniform float opacity;

        in vec3 vPosition;
        in vec2 vUv;
        in vec3 vNormal;

        out vec4 fragmentColor;

        ${calcDirLight}

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(${U.CAMERA_POSITION} - vPosition);
            vec3 result = vec3(0.0, 0.0, 0.0);

            ${diffuseTexelColor}
            ${specularTexelColor}

            for(int i = 0; i < ${U.DIR_LIGHT_COUNT}; i++) {
                result += CalcDirLight(${U.DIR_LIGHT_DIRECTION}[i], ${U.DIR_LIGHT_COLOR}[i], ${U.DIR_LIGHT_INTENSITY}[i], normal, viewDir, diffuseColor, specularColor);
            }

            fragmentColor = vec4(result, opacity);
        }
    `.trim();
}

type Args = {
    ambientIntensity?: number;
    diffuseColor?: vec3;
    diffuseMap?: HTMLImageElement;
    specularColor?: vec3;
    specularMap?: HTMLImageElement;
    specularShininess?: number;
    opacity?: number;
};

export class PhongMaterial implements Material {
    ambientIntensity: number;
    diffuseColor: vec3;
    diffuseMap: Nullable<HTMLImageElement>;
    specularColor: vec3;
    specularMap: Nullable<HTMLImageElement>;
    specularShininess: number;
    opacity: number;
    dirty: {
        ambientIntensity: boolean;
        diffuseColor: boolean;
        diffuseMap: boolean;
        specularColor: boolean;
        specularMap: boolean;
        specularShininess: boolean;
        opacity: boolean;
    };

    constructor(args: Args = {}) {
        this.ambientIntensity = args.ambientIntensity || 0.1;
        this.diffuseColor = args.diffuseColor || [1, 0, 0];
        this.diffuseMap = args.diffuseMap || null;
        this.specularColor = args.specularColor || [1, 1, 1];
        this.specularMap = args.specularMap || null;
        this.specularShininess = args.specularShininess || 256;
        this.opacity = args.opacity || 1;
        this.dirty = {
            ambientIntensity: true,
            diffuseColor: true,
            diffuseMap: true,
            specularColor: true,
            specularMap: true,
            specularShininess: true,
            opacity: true,
        };
    }

    getUniformValue(uniformName: string): unknown | null {
        if (!this.dirty[uniformName as keyof PhongMaterial['dirty']]) return null;
        this.dirty[uniformName as keyof PhongMaterial['dirty']] = false;
        return this[uniformName as keyof PhongMaterial['dirty']];
    }

    getTexture(gl: WebGL2RenderingContext, uniformName: string): WebGLTexture | null {
        if (uniformName === 'diffuseMap' && this.diffuseMap) {
            return createTexture2D(gl, this.diffuseMap);
        } else if (uniformName === 'specularMap' && this.specularMap) {
            return createTexture2D(gl, this.specularMap);
        } else {
            return null;
        }
    }

    getShaderSourceCode({ geometryData }: ShaderSourceArgs): ShaderSourceCode {
        const useDiffuseMap = !!this.diffuseMap && !!geometryData.uvs;
        const useSpecularMap = !!this.specularMap && !!geometryData.uvs;
        const fragmentShaderArgs: FragmentShaderArgs = { useDiffuseMap, useSpecularMap };
        return {
            vertexShader: getVertexShader(),
            fragmentShader: getFragmentShader(fragmentShaderArgs),
        };
    }

    setAmbientIntensity(intensity: number): void {
        this.ambientIntensity = intensity;
        this.dirty.ambientIntensity = true;
    }

    setDiffuseColor(r: number, g: number, b: number): void {
        this.diffuseColor[0] = r;
        this.diffuseColor[1] = g;
        this.diffuseColor[2] = b;
        this.dirty.diffuseColor = true;
    }

    setSpecularColor(r: number, g: number, b: number): void {
        this.specularColor[0] = r;
        this.specularColor[1] = g;
        this.specularColor[2] = b;
        this.dirty.specularColor = true;
    }

    setSpecularShininess(shininess: number): void {
        this.specularShininess = shininess;
        this.dirty.specularShininess = true;
    }

    setOpacity(opacity: number): void {
        this.opacity = opacity;
        this.dirty.opacity = true;
    }
}