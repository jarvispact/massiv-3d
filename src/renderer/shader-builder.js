/* eslint-disable max-len */

const ShaderBuilder = {
    StandardMaterial: {
        buildShaderWithUniforms(shaderLayoutLocations, uniformTypes) {
            const vertexShaderSource = `
                #version 300 es
    
                precision highp float;
                precision highp int;
    
                layout(location = ${shaderLayoutLocations.VERTEX}) in vec3 position;
                layout(location = ${shaderLayoutLocations.NORMAL}) in vec3 normal;
                layout(location = ${shaderLayoutLocations.UV}) in vec2 uv;
    
                uniform ${uniformTypes.MAT4} modelMatrix;
                uniform ${uniformTypes.MAT4} mvp;
                uniform ${uniformTypes.MAT3} normalMatrix;
    
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
                #version 300 es
    
                precision highp float;
                precision highp int;

                const int MAX_DIRECTIONAL_LIGHTS = 5;
    
                in vec3 vPosition;
                in vec3 vNormal;
                in vec2 vUv;

                uniform ${uniformTypes.VEC3} diffuseColor;
                uniform ${uniformTypes.VEC3} specularColor;
                uniform ${uniformTypes.FLOAT} ambientIntensity;
                uniform ${uniformTypes.FLOAT} specularExponent;
                uniform ${uniformTypes.FLOAT} specularShininess;

                uniform ${uniformTypes.VEC3} cameraPosition;
                uniform ${uniformTypes.VEC3} dirLightDirection[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.VEC3} dirLightAmbientColor[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.VEC3} dirLightDiffuseColor[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.VEC3} dirLightSpecularColor[MAX_DIRECTIONAL_LIGHTS];
                uniform ${uniformTypes.INT} numDirLights;
    
                out vec4 fragmentColor;
    
                vec3 CalcDirLight(vec3 dirLightDirection, vec3 dirLightAmbientColor, vec3 dirLightDiffuseColor, vec3 dirLightSpecularColor, vec3 normal, vec3 viewDir)
                {
                    vec3 lightDir = normalize(dirLightDirection);
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
                    vec3 ambient  = (dirLightAmbientColor * diffuseColor) * ambientIntensity;
                    vec3 diffuse  = dirLightDiffuseColor * diff * diffuseColor;
                    vec3 specular = dirLightSpecularColor * spec * specularColor;
                    return ambient + diffuse + specular;
                }
    
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 result = vec3(0.0, 0.0, 0.0);
    
                    for(int i = 0; i < numDirLights; i++) {
                        result += CalcDirLight(dirLightDirection[i], dirLightAmbientColor[i], dirLightDiffuseColor[i], dirLightSpecularColor[i], normal, viewDir);
                    }
    
                    fragmentColor = vec4(result, 1.0);
                }
            `;

            return {
                vertexShaderSourceCode: vertexShaderSource.trim(),
                fragmentShaderSourceCode: fragmentShaderSource.trim(),
            };
        },
        buildShaderWithUniformBuffers(shaderLayoutLocations) {
            const vertexShaderSource = `
                #version 300 es

                precision highp float;
                precision highp int;

                layout(location = ${shaderLayoutLocations.VERTEX}) in vec3 position;
                layout(location = ${shaderLayoutLocations.NORMAL}) in vec3 normal;
                layout(location = ${shaderLayoutLocations.UV}) in vec2 uv;

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
    },
};

export default ShaderBuilder;
