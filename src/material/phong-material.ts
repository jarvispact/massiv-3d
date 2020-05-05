import { vec3 } from 'gl-matrix';
import { Material, ShaderSourceCode } from './material';
import { UNIFORM, ATTRIBUTE } from '../webgl2/webgl-2-utils';

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
        if (!this.dirty[uniformName as keyof PhongMaterial['dirty']]) return null;
        this.dirty[uniformName as keyof PhongMaterial['dirty']] = false;
        return this[uniformName as keyof PhongMaterial['dirty']];
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

const calcDirLight = `
    vec3 CalcDirLight(vec3 lDir, vec3 lDiffuse, vec3 lSpecular, float lIntensity, vec3 normal, vec3 viewDir, vec3 materialDiffuse, vec3 materialSpecular) {
        vec3 direction = normalize(lDir);
        float diff = max(dot(normal, direction), 0.0);
        vec3 reflectDir = reflect(-direction, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
        vec3 ambient  = materialDiffuse * ambientIntensity;
        vec3 diffuse  = lDiffuse * diff * materialDiffuse * lIntensity;
        vec3 specular = lDiffuse * spec * materialSpecular * lIntensity;
        return ambient + diffuse + specular;
    }
`;

const A = ATTRIBUTE;
const U = UNIFORM;

const vertexShader = `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = ${A.POSITION.LOCATION}) in vec3 ${A.POSITION.NAME};
    layout(location = ${A.NORMAL.LOCATION}) in vec3 ${A.NORMAL.NAME};

    uniform mat4 ${U.MODEL_MATRIX};
    uniform mat4 ${U.MODEL_VIEW_MATRIX};
    uniform mat3 ${U.NORMAL_MATRIX};
    uniform mat4 ${U.PROJECTION_MATRIX};

    out vec3 vPosition;
    out vec3 vNormal;

    void main() {
        vNormal = ${U.NORMAL_MATRIX} * normal;
        vPosition = vec3(${U.MODEL_MATRIX} * vec4(${A.POSITION.NAME}, 1.0));
        gl_Position = ${U.PROJECTION_MATRIX} * ${U.MODEL_VIEW_MATRIX} * vec4(${A.POSITION.NAME}, 1.0);
    }
`.trim();

const fragmentShader = `
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
    uniform vec3 diffuseColor;
    uniform vec3 specularColor;
    uniform float specularShininess;
    uniform float opacity;

    in vec3 vPosition;
    in vec3 vNormal;

    out vec4 fragmentColor;

    ${calcDirLight}

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(${U.CAMERA_POSITION} - vPosition);
        vec3 result = vec3(0.0, 0.0, 0.0);

        for(int i = 0; i < ${U.DIR_LIGHT_COUNT}; i++) {
            result += CalcDirLight(${U.DIR_LIGHT_DIRECTION}[i], ${U.DIR_LIGHT_COLOR}[i], vec3(1.0, 1.0, 1.0), ${U.DIR_LIGHT_INTENSITY}[i], normal, viewDir, diffuseColor, specularColor);
        }

        fragmentColor = vec4(result, opacity);
    }
`.trim();

PhongMaterial.getShaderSourceCode = (): ShaderSourceCode => ({
    vertexShader,
    fragmentShader,
});