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
    
                uniform mat4 transformModelMatrix;
                uniform mat4 transformModelViewMatrix;
                uniform mat3 transformNormalMatrix;

                uniform mat4 cameraProjectionMatrix;
    
                out vec3 vPosition;
                out vec3 vNormal;
                out vec2 vUv;
    
                void main() {
                    vNormal = transformNormalMatrix * normal;
                    vPosition = vec3(transformModelMatrix * vec4(position, 1.0));
                    vUv = uv;
                    gl_Position = cameraProjectionMatrix * transformModelViewMatrix * vec4(position, 1.0);
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

                uniform vec3 materialDiffuseColor;
                uniform vec3 materialSpecularColor;
                uniform float materialAmbientIntensity;
                uniform float materialSpecularExponent;
                uniform float materialSpecularShininess;

                uniform sampler2D materialDiffuseMap;
                uniform sampler2D materialSpecularMap;

                uniform vec3 cameraPosition;

                uniform vec3 dirLightDirection[MAX_DIRECTIONAL_LIGHTS];
                uniform vec3 dirLightAmbientColor[MAX_DIRECTIONAL_LIGHTS];
                uniform vec3 dirLightDiffuseColor[MAX_DIRECTIONAL_LIGHTS];
                uniform vec3 dirLightSpecularColor[MAX_DIRECTIONAL_LIGHTS];
                uniform int dirLightCount;
    
                out vec4 fragmentColor;
    
                vec3 CalcDirLight(vec3 dirLightDirection, vec3 dirLightAmbientColor, vec3 dirLightDiffuseColor, vec3 dirLightSpecularColor, vec3 normal, vec3 viewDir)
                {
                    #ifdef USE_DIFFUSE_MAP
                    vec3 materialDiffuseColor = texture(materialDiffuseMap, vUv).xyz;
                    #endif

                    #ifdef USE_SPECULAR_MAP
                    vec3 materialSpecularColor = texture(materialSpecularMap, vUv).xyz;
                    #endif

                    vec3 lightDir = normalize(dirLightDirection);
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), materialSpecularShininess);
                    vec3 ambient  = (dirLightAmbientColor * materialDiffuseColor) * materialAmbientIntensity;
                    vec3 diffuse  = dirLightDiffuseColor * diff * materialDiffuseColor;
                    vec3 specular = dirLightSpecularColor * spec * materialSpecularColor;
                    return ambient + diffuse + specular;
                }
    
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 result = vec3(0.0, 0.0, 0.0);
    
                    for(int i = 0; i < dirLightCount; i++) {
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
