/* eslint-disable max-len */

import WebGLUtils from './webgl-utils';

const ShaderBuilder = {
    STANDARD_MATERIAL: {
        buildShader(material) {
            const useDiffuseMap = !!material.diffuseMap;
            const useSpecularMap = !!material.specularMap;

            const vertexShaderSource = `
                #version 300 es
    
                precision highp float;
                precision highp int;
    
                layout(location = ${WebGLUtils.SHADER_LAYOUT_LOCATIONS.VERTEX}) in vec3 position;
                layout(location = ${WebGLUtils.SHADER_LAYOUT_LOCATIONS.NORMAL}) in vec3 normal;
                layout(location = ${WebGLUtils.SHADER_LAYOUT_LOCATIONS.UV}) in vec2 uv;
    
                uniform mat4 modelMatrix;
                uniform mat4 mvp;
                uniform mat3 normalMatrix;
    
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

                ${useDiffuseMap ? '#define USE_DIFFUSE_MAP' : ''}
                ${useSpecularMap ? '#define USE_SPECULAR_MAP' : ''}
    
                precision highp float;
                precision highp int;

                const int MAX_DIRECTIONAL_LIGHTS = 5;
    
                in vec3 vPosition;
                in vec3 vNormal;
                in vec2 vUv;

                uniform vec3 diffuseColor;
                uniform vec3 specularColor;
                uniform float ambientIntensity;
                uniform float specularExponent;
                uniform float specularShininess;

                uniform sampler2D diffuseMap;
                uniform sampler2D specularMap;

                uniform vec3 cameraPosition;
                uniform vec3 dirLightDirection[MAX_DIRECTIONAL_LIGHTS];
                uniform vec3 dirLightAmbientColor[MAX_DIRECTIONAL_LIGHTS];
                uniform vec3 dirLightDiffuseColor[MAX_DIRECTIONAL_LIGHTS];
                uniform vec3 dirLightSpecularColor[MAX_DIRECTIONAL_LIGHTS];
                uniform int numDirLights;
    
                out vec4 fragmentColor;
    
                vec3 CalcDirLight(vec3 dirLightDirection, vec3 dirLightAmbientColor, vec3 dirLightDiffuseColor, vec3 dirLightSpecularColor, vec3 normal, vec3 viewDir)
                {
                    #ifdef USE_DIFFUSE_MAP
                    vec3 diffuseColor = texture(diffuseMap, vUv).xyz;
                    #endif

                    #ifdef USE_SPECULAR_MAP
                    vec3 specularColor = texture(specularMap, vUv).xyz;
                    #endif

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
    },
};

export default ShaderBuilder;
