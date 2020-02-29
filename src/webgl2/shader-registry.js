const getVertexShader = (renderable) => {
    return `
        #version 300 es

        precision highp float;
        precision highp int;

        layout(location = 0) in vec3 position;
        layout(location = 1) in vec2 uv;
        layout(location = 2) in vec3 normal;

        uniform mat4 modelMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat3 normalMatrix;

        uniform mat4 projectionMatrix;

        out vec3 vPosition;
        out vec3 vNormal;
        out vec2 vUv;

        void main() {
            vNormal = normalMatrix * normal;
            vPosition = vec3(modelMatrix * vec4(position, 1.0));
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `.trim();
};

const getFragmentShader = (renderable) => {
    const useDiffuseMap = !!renderable.material.diffuseMap;
    const useSpecularMap = !!renderable.material.specularMap;

    return `
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
        uniform float specularShininess;
        uniform float opacity;

        uniform sampler2D diffuseMap;
        uniform sampler2D specularMap;

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

            for(int i = 0; i < dirLightCount; i++) {
                result += CalcDirLight(dirLightDirection[i], dirLightAmbientColor[i], dirLightDiffuseColor[i], dirLightSpecularColor[i], normal, viewDir);
            }

            fragmentColor = vec4(result, opacity);
        }
    `.trim();
};

const ShaderRegistry = {
    getVertexShader,
    getFragmentShader,
};

export default ShaderRegistry;
