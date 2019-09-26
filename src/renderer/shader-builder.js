const ShaderBuilder = {
    buildShaderForStandardMaterial(shaderLayoutLocations) {
        const vertexShaderSource = `
            #version 300 es

            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.normal}) in vec3 normal;
            layout(location = ${shaderLayoutLocations.uv}) in vec2 uv;

            layout(std140, column_major) uniform;

            struct Matrices {
                mat4 modelMatrix;
                mat4 mvp;
                mat3 normalMatrix;
            };

            uniform MatricesUniform {
                Matrices matrices;
            };

            out vec3 vPosition;
            out vec3 vNormal;
            out vec2 vUv;

            void main() {
                vNormal = matrices.normalMatrix * normal;
                vPosition = vec3(matrices.modelMatrix * vec4(position, 1.0));
                vUv = uv;
                gl_Position = matrices.mvp * vec4(position, 1.0);
            }
        `;

        const fragmentShaderSource = `
            #version 300 es

            precision highp float;
            precision highp int;

            const int MAX_DIRECTIONAL_LIGHTS = 5;

            layout(std140, column_major) uniform;

            struct DirectionalLight {
                vec3 direction;
                vec3 ambientColor;
                vec3 diffuseColor;
                vec3 specularColor;
            };

            struct StandardMaterial {
                vec3 diffuseColor;
                vec3 specularColor;
                float ambientIntensity;
                float specularExponent;
                float specularShininess;
            };

            uniform SceneUniform {
                DirectionalLight directionalLights[MAX_DIRECTIONAL_LIGHTS];
                int numDirectionalLights;
                vec3 cameraPosition;
            };

            uniform MaterialUniform {
                StandardMaterial material;
            };

            in vec3 vPosition;
            in vec3 vNormal;
            in vec2 vUv;

            out vec4 fragmentColor;

            vec3 CalcDirLight(DirectionalLight light, vec3 normal, vec3 viewDir)
            {
                vec3 lightDir = normalize(light.direction);
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 reflectDir = reflect(-lightDir, normal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.specularShininess);
                vec3 ambient  = (light.ambientColor * material.diffuseColor) * material.ambientIntensity;
                vec3 diffuse  = light.diffuseColor * diff * material.diffuseColor;
                vec3 specular = light.specularColor * spec * material.specularColor;
                return ambient + diffuse + specular;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(cameraPosition - vPosition);
                vec3 result = vec3(0.0, 0.0, 0.0);

                for(int i = 0; i < numDirectionalLights; i++) {
                    result += CalcDirLight(directionalLights[i], normal, viewDir);
                }

                fragmentColor = vec4(result, 1.0);
            }
        `;

        return {
            vertexShaderSourceCode: vertexShaderSource.trim(),
            fragmentShaderSourceCode: fragmentShaderSource.trim(),
        };
    },
};

export default ShaderBuilder;
