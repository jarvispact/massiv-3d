import Material from './material';
import WebGLRenderer from './webgl-renderer';

const getShaderVersion = () => '#version 300 es\n\n';

export const getUniformsDeclaration = (uniforms) => {
    const keys = Object.keys(uniforms).filter(key => uniforms[key]);
    return keys.map(key => `uniform ${uniforms[key]} ${key};`).join('\n');
};

export default class BlinnPhongMaterial extends Material {
    constructor({ name, indices, diffuseTexture } = {}) {
        super({ name, indices });
        this.ambientColor = [];
        this.diffuseColor = [];
        this.specularColor = [];
        this.specularExponent = 0.0;
        this.diffuseTexture = diffuseTexture;
    }

    getShaderSource() {
        const { diffuseTexture } = this;

        const uniforms = {
            vertexShader: {
                modelMatrix: 'mat4',
                normalMatrix: 'mat3',
                modelViewProjectionMatrix: 'mat4',
            },
            fragmentShader: {
                diffuseTexture: diffuseTexture ? 'sampler2D' : undefined,
                cameraPosition: 'vec3',
            },
        };

        const textures = {
            diffuseTexture,
        };

        const vSource = `
            precision ${WebGLRenderer.SHADER_FLOAT_PRECISION} float;
            precision ${WebGLRenderer.SHADER_INT_PRECISION} int;

            layout(location = ${WebGLRenderer.SHADER_POSITION_LOCATION}) in vec3 position;
            layout(location = ${WebGLRenderer.SHADER_NORMAL_LOCATION}) in vec3 normal;
            layout(location = ${WebGLRenderer.SHADER_UV_LOCATION}) in vec2 uv;

            ${getUniformsDeclaration(uniforms.vertexShader)}

            out vec3 vPosition;
            out vec3 vNormal;
            out vec2 vUv;

            void main() {
                vUv = uv;
                vNormal = normalMatrix * normal;
                vPosition = (modelMatrix * vec4( position, 1.0 )).xyz;
                gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);
            }
        `;

        const fSource = `
            precision ${WebGLRenderer.SHADER_FLOAT_PRECISION} float;
            precision ${WebGLRenderer.SHADER_INT_PRECISION} int;

            in vec3 vPosition;
            in vec3 vNormal;
            in vec2 vUv;

            ${getUniformsDeclaration(uniforms.fragmentShader)}

            vec4 specularColor;
            float specularAmount;
            float specularShininess;

            vec3 light;

            out vec4 fragmentColor;

            void main() {
                specularColor = vec4(1.0, 1.0, 1.0, 1.0);
                specularAmount = 0.5;
                specularShininess = 50.0;
                light = normalize(vec3(5.0, 5.0, 5.0));

                vec3 directionToCamera = normalize(cameraPosition - vPosition);
                vec3 halfwayVector = normalize( directionToCamera + light );

                float specularBrightness = (
                specularAmount *
                pow(
                    max(0.0, dot(vNormal, halfwayVector)),
                    specularShininess
                )
                );

                float lightDotProduct = dot( normalize(vNormal), light );
                float surfaceBrightness = max( 0.0, lightDotProduct );
                vec4 texelColor = texture(diffuseTexture, vUv);

                fragmentColor = vec4(texelColor.rgb * surfaceBrightness + specularColor.xyz * specularBrightness, texelColor.a);
            }
        `;

        const vertexShaderSource = `${getShaderVersion()}${vSource}`;
        const fragmentShaderSource = `${getShaderVersion()}${fSource}`;

        return { vertexShaderSource, fragmentShaderSource, uniforms, textures };
    }
}
