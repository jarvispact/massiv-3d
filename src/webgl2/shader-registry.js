/* eslint-disable max-len */

import WebGL2Utils from './webgl-2-utils';

const C = WebGL2Utils.CONSTANT;
const A = WebGL2Utils.ATTRIBUTE;
const V = WebGL2Utils.VARYING;
const U = WebGL2Utils.UNIFORM;

const VERSION = '#version 300 es\n\n';
const PRECISION = 'precision highp float;\nprecision highp int;\n\n';

const CONST = (constant) => `const ${constant.TYPE} ${constant.NAME} = ${constant.VALUE};`;
const ATTRIB = (attrib) => `layout(location = ${attrib.LOCATION}) in ${attrib.TYPE} ${attrib.NAME};`;
const VARYING = (direction, varying) => `${direction} ${varying.TYPE} ${varying.NAME};`;
const UNIFORM = (uniform) => `uniform ${uniform.TYPE} ${uniform.DECLARATION || uniform.NAME};`;

// TODO: only write attribs, varyings, etc. when data (normals, uvs, etc) is here
// or do a validation step to ensure that a PhongMaterial needs normals for example

const FRAGMENT_SHADER_CONSTANTS = {
    NormalMaterial: () => {
        return '';
    },
    PhongMaterial: () => {
        const constantBlock = [
            CONST(C.MAX_DIRECTIONAL_LIGHTS),
        ].join('\n');

        return `${constantBlock}\n\n`;
    },
};

const ATTRIBS = {
    NormalMaterial: () => {
        const attributeBlock = [
            ATTRIB(A.POSITION),
            ATTRIB(A.NORMAL),
        ].join('\n');

        return `${attributeBlock}\n\n`;
    },
    PhongMaterial: () => {
        const attributeBlock = [
            ATTRIB(A.POSITION),
            ATTRIB(A.UV),
            ATTRIB(A.NORMAL),
            ATTRIB(A.COLOR),
        ].join('\n');

        return `${attributeBlock}\n\n`;
    },
};

const VERTEX_SHADER_VARYINGS = {
    NormalMaterial: () => {
        const varyingBlock = [
            VARYING('out', V.NORMAL),
        ].join('\n');

        return `${varyingBlock}\n\n`;
    },
    PhongMaterial: () => {
        const varyingBlock = [
            VARYING('out', V.POSITION),
            VARYING('out', V.UV),
            VARYING('out', V.NORMAL),
        ].join('\n');

        return `${varyingBlock}\n\n`;
    },
};

const FRAGMENT_SHADER_VARYINGS = {
    NormalMaterial: () => {
        const varyingBlock = [
            VARYING('in', V.NORMAL),
        ].join('\n');

        return `${varyingBlock}\n\n`;
    },
    PhongMaterial: () => {
        const varyingBlock = [
            VARYING('in', V.POSITION),
            VARYING('in', V.UV),
            VARYING('in', V.NORMAL),
        ].join('\n');

        return `${varyingBlock}\n\n`;
    },
};

const VERTEX_SHADER_UNIFORMS = {
    NormalMaterial: () => {
        const uniformBlock = [
            UNIFORM(U.MODEL_VIEW_MATRIX),
            UNIFORM(U.NORMAL_MATRIX),
            UNIFORM(U.PROJECTION_MATRIX),
        ].join('\n');

        return `${uniformBlock}\n\n`;
    },
    PhongMaterial: () => {
        const uniformBlock = [
            UNIFORM(U.MODEL_MATRIX),
            UNIFORM(U.MODEL_VIEW_MATRIX),
            UNIFORM(U.NORMAL_MATRIX),
            UNIFORM(U.PROJECTION_MATRIX),
        ].join('\n');

        return `${uniformBlock}\n\n`;
    },
};

const FRAGMENT_SHADER_UNIFORMS = {
    NormalMaterial: () => {
        const uniformBlock = [
            UNIFORM(U.OPACITY),
        ].join('\n');

        return `${uniformBlock}\n\n`;
    },
    PhongMaterial: (material) => {
        const useDiffuseMap = !!material.diffuseMap;
        const useSpecularMap = !!material.specularMap;

        const uniformBlock = [
            UNIFORM(U.DIFFUSE_COLOR),
            UNIFORM(U.SPECULAR_COLOR),
            UNIFORM(U.AMBIENT_INTENSITY),
            UNIFORM(U.SPECULAR_SHININESS),
            UNIFORM(U.OPACITY),

            ...useDiffuseMap ? [UNIFORM(U.DIFFUSE_MAP)] : [],
            ...useSpecularMap ? [UNIFORM(U.SPECULAR_MAP)] : [],

            UNIFORM(U.CAMERA_POSITION),

            UNIFORM(U.DIR_LIGHT_DIRECTIONS),
            UNIFORM(U.DIR_LIGHT_AMBIENT_COLORS),
            UNIFORM(U.DIR_LIGHT_DIFFUSE_COLORS),
            UNIFORM(U.DIR_LIGHT_SPECULAR_COLORS),
            UNIFORM(U.DIR_LIGHT_INTENSITIES),
            UNIFORM(U.DIR_LIGHT_COUNT),
        ].join('\n');

        return `${uniformBlock}\n\n`;
    },
};

const FNS = {
    NormalMaterial: () => {
        return '';
    },
    PhongMaterial: () => {
        const fnBlock = [
            'vec3 CalcDirLight(vec3 lDir, vec3 lAmbient, vec3 lDiffuse, vec3 lSpecular, float lIntensity, vec3 normal, vec3 viewDir, vec3 materialDiffuse, vec3 materialSpecular) {',
            '\tvec3 direction = normalize(lDir);',
            '\tfloat diff = max(dot(normal, direction), 0.0);',
            '\tvec3 reflectDir = reflect(-direction, normal);',
            `\tfloat spec = pow(max(dot(viewDir, reflectDir), 0.0), ${U.SPECULAR_SHININESS.NAME});`,
            `\tvec3 ambient  = (lAmbient * materialDiffuse) * ${U.AMBIENT_INTENSITY.NAME};`,
            '\tvec3 diffuse  = lDiffuse * diff * materialDiffuse * lIntensity;',
            '\tvec3 specular = lSpecular * spec * materialSpecular * lIntensity;',
            '\treturn ambient + diffuse + specular;',
            '}',
        ].join('\n');

        return `${fnBlock}\n\n`;
    },
};

const VERTEX_SHADER_MAIN = {
    NormalMaterial: () => {
        return [
            'void main() {',
            `\t${V.NORMAL.NAME} = ${U.NORMAL_MATRIX.NAME} * ${A.NORMAL.NAME};`,
            `\tgl_Position = ${U.PROJECTION_MATRIX.NAME} * ${U.MODEL_VIEW_MATRIX.NAME} * vec4(${A.POSITION.NAME}, 1.0);`,
            '}',
        ].join('\n');
    },
    PhongMaterial: () => {
        return [
            'void main() {',
            `\t${V.NORMAL.NAME} = ${U.NORMAL_MATRIX.NAME} * ${A.NORMAL.NAME};`,
            `\t${V.POSITION.NAME} = vec3(${U.MODEL_MATRIX.NAME} * vec4(${A.POSITION.NAME}, 1.0));`,
            `\t${V.UV.NAME} = ${A.UV.NAME};`,
            `\tgl_Position = ${U.PROJECTION_MATRIX.NAME} * ${U.MODEL_VIEW_MATRIX.NAME} * vec4(${A.POSITION.NAME}, 1.0);`,
            '}',
        ].join('\n');
    },
};

const FRAGMENT_SHADER_MAIN = {
    NormalMaterial: () => {
        return [
            'void main() {',
            `\tvec3 normal = normalize(${V.NORMAL.NAME});`,
            '\tfragmentColor = vec4(normal, opacity);',
            '}',
        ].join('\n');
    },
    PhongMaterial: (material) => {
        const useDiffuseMap = !!material.diffuseMap;
        const useSpecularMap = !!material.specularMap;
        const diffuseColorDeclaration = useDiffuseMap ? '\tvec3 materialDiffuse = texture(diffuseMap, vUv).xyz;\n' : '';
        const specularColorDeclaration = useSpecularMap ? '\tvec3 materialSpecular = texture(specularMap, vUv).xyz;\n' : '';
        const diffuseColorArgName = useDiffuseMap ? 'materialDiffuse' : U.DIFFUSE_COLOR.NAME;
        const specularColorArgName = useSpecularMap ? 'materialSpecular' : U.SPECULAR_COLOR.NAME;

        return [
            'void main() {',
            `\tvec3 normal = normalize(${V.NORMAL.NAME});`,
            `\tvec3 viewDir = normalize(${U.CAMERA_POSITION.NAME} - ${V.POSITION.NAME});`,
            '\tvec3 result = vec3(0.0, 0.0, 0.0);',
            diffuseColorDeclaration,
            specularColorDeclaration,
            `\tfor(int i = 0; i < ${U.DIR_LIGHT_COUNT.NAME}; i++) {`,
            `\t\tresult += CalcDirLight(${U.DIR_LIGHT_DIRECTIONS.NAME_WITH_INDEX}, ${U.DIR_LIGHT_AMBIENT_COLORS.NAME_WITH_INDEX}, ${U.DIR_LIGHT_DIFFUSE_COLORS.NAME_WITH_INDEX}, ${U.DIR_LIGHT_SPECULAR_COLORS.NAME_WITH_INDEX}, ${U.DIR_LIGHT_INTENSITIES.NAME_WITH_INDEX}, normal, viewDir, ${diffuseColorArgName}, ${specularColorArgName});`,
            '\t}\n',
            '\tfragmentColor = vec4(result, opacity);',
            '}',
        ].join('\n');
    },
};

const getVertexShader = (renderable) => {
    const sourceCode = [
        VERSION,
        PRECISION,
        ATTRIBS[renderable.material.constructor.name](),
        VERTEX_SHADER_UNIFORMS[renderable.material.constructor.name](),
        VERTEX_SHADER_VARYINGS[renderable.material.constructor.name](),
        VERTEX_SHADER_MAIN[renderable.material.constructor.name](),
    ].join('').trim();

    console.log('vertex');
    console.log(sourceCode);
    return sourceCode;
};

const getFragmentShader = (renderable) => {
    const sourceCode = [
        VERSION,
        PRECISION,
        FRAGMENT_SHADER_CONSTANTS[renderable.material.constructor.name](),
        FRAGMENT_SHADER_VARYINGS[renderable.material.constructor.name](),
        FRAGMENT_SHADER_UNIFORMS[renderable.material.constructor.name](renderable.material),
        'out vec4 fragmentColor;\n\n',
        FNS[renderable.material.constructor.name](),
        FRAGMENT_SHADER_MAIN[renderable.material.constructor.name](renderable.material),
    ].join('').trim();

    console.log('fragment');
    console.log(sourceCode);
    return sourceCode;
};

const ShaderRegistry = {
    getVertexShader,
    getFragmentShader,
};

export default ShaderRegistry;
