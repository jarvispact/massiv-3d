import Material from './material';
import Vec3 from '../math/vec3';

const getUniformsDeclaration = (uniforms) => {
    const keys = Object.keys(uniforms).filter(key => uniforms[key]);
    return keys.map(key => `uniform ${uniforms[key]} ${key};`).join('\n');
};

class StandardMaterial extends Material {
    constructor({ indices, ambientIntensity, diffuseColor, specularColor, specularExponent, specularShininess } = {}) {
        super({ indices });
        this.ambientIntensity = ambientIntensity || 0.1;
        this.diffuseColor = diffuseColor || new Vec3(1, 0, 0, 1);
        this.specularColor = specularColor || new Vec3(1, 1, 1, 1);
        this.specularExponent = specularExponent || 0.5;
        this.specularShininess = specularShininess || 256.0;
    }

    getAmbientIntensity() {
        return this.ambientIntensity;
    }

    setAmbientIntensity(ambientIntensity) {
        this.ambientIntensity = ambientIntensity;
        return this;
    }

    getDiffuseColor() {
        return this.diffuseColor;
    }

    setDiffuseColor(r, g, b) {
        this.diffuseColor = new Vec3(r, g, b);
        return this;
    }

    getSpecularColor() {
        return this.specularColor;
    }

    setSpecularColor(r, g, b) {
        this.specularColor = new Vec3(r, g, b);
        return this;
    }

    getSpecularExponent() {
        return this.specularExponent;
    }

    setSpecularExponent(specularExponent) {
        this.specularExponent = specularExponent;
        return this;
    }

    getSpecularShininess() {
        return this.specularShininess;
    }

    setSpecularShininess(specularShininess) {
        this.specularShininess = specularShininess;
        return this;
    }

    getShaderData({ shaderLayoutLocations }) {
        const { diffuseColor, specularColor, specularExponent, specularShininess } = this;

        const uniforms = {
            vertexShader: {
                modelMatrix: 'mat4',
                mvp: 'mat4',
                normalMatrix: 'mat3',
            },
            fragmentShader: {
                ambientIntensity: 'float',
                lightDirection: 'vec3',
                lightColor: 'vec3',
                cameraPosition: 'vec3',
                diffuseColor: diffuseColor ? 'vec3' : undefined,
                specularColor: specularColor ? 'vec3' : undefined,
                specularExponent: specularExponent ? 'float' : undefined,
                specularShininess: specularShininess ? 'float' : undefined,
            },
        };

        const vertexShaderSource = `
            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.normal}) in vec3 normal;
            layout(location = ${shaderLayoutLocations.uv}) in vec2 uv;

            ${getUniformsDeclaration(uniforms.vertexShader)}

            out vec3 vPosition;
            out vec3 vNormal;
            out vec2 vUv;

            void main() {
                vNormal = normalMatrix * normal;
                vPosition = vec3(modelMatrix * vec4(position, 1.0));
                vUv = uv;
                gl_Position = mvp * vec4(position, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;
            precision highp int;

            ${getUniformsDeclaration(uniforms.fragmentShader)}

            in vec3 vPosition;
            in vec3 vNormal;
            in vec2 vUv;

            out vec4 fragmentColor;

            void main() {
                // ambient
                vec3 ambient = ambientIntensity * lightColor;

                // diffuse
                vec3 norm = normalize(vNormal);
                // vec3 lightDir = normalize(lightPosition - vPosition);
                vec3 lightDir = normalize(lightDirection);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * lightColor;

                //specular
                vec3 viewDir = normalize(cameraPosition - vPosition);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
                vec3 specular = specularExponent * spec * lightColor;

                vec3 result = (ambient + diffuse + specular) * diffuseColor;
                fragmentColor = vec4(result, 1.0);
            }
        `;

        const vertexShaderSourceCode = `${this.shaderVersion}${vertexShaderSource}`;
        const fragmentShaderSourceCode = `${this.shaderVersion}${fragmentShaderSource}`;

        return {
            vertexShaderSourceCode,
            fragmentShaderSourceCode,
            uniforms,
        };
    }

    clone() {
        const clone = new StandardMaterial();
        clone.setIndices([...this.indices]);
        clone.ambientIntensity = this.ambientIntensity;
        clone.diffuseColor = this.diffuseColor.clone();
        clone.specularColor = this.specularColor.clone();
        clone.specularExponent = this.specularExponent;
        clone.specularShininess = this.specularShininess;
        return clone;
    }
}

export default StandardMaterial;
