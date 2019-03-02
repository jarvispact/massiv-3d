const getShaderVersion = () => '#version 300 es\n\n';
const getFloatPrecision = precision => `precision ${precision} float;\n`;
const getIntPrecision = precision => `precision ${precision} int;\n\n`;

export const getShaderHeader = ({ floatPrecision, intPrecision }) => {
    const version = getShaderVersion();
    const floatP = getFloatPrecision(floatPrecision);
    const intP = getIntPrecision(intPrecision);
    return `${version}${floatP}${intP}`;
};

export const getUniformsDeclaration = (uniforms) => {
    const keys = Object.keys(uniforms).filter(key => uniforms[key]);
    return keys.map(key => `uniform ${uniforms[key]} ${key};`).join('\n');
};

export const getBlinnPhongShaderSource = (rendererArguments) => {
    const {
        floatPrecision,
        intPrecision,
        positionLocation,
        normalLocation,
        uvLocation,
        uniforms,
    } = rendererArguments;

    const { vertexShader: vUniforms, fragmentShader: fUniforms } = uniforms;

    const vSource = `
        layout(location = ${positionLocation}) in vec3 position;
        layout(location = ${normalLocation}) in vec3 normal;
        layout(location = ${uvLocation}) in vec2 uv;

        ${getUniformsDeclaration(vUniforms)}

        out vec3 vPosition;
        out vec3 vNormal;
        out vec2 vUv;

        void main() {
            vUv = uv;
            vNormal = normalMatrix * normal;
            vPosition = (modelMatrix * vec4( position, 1.0 )).xyz;
            // gl_Position = mvp * vec4(position, 1.0);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `;

    const fSource = `
        in vec3 vPosition;
        in vec3 vNormal;
        in vec2 vUv;

        ${getUniformsDeclaration(fUniforms)}

        // This is needed to figure out the specular highlight
        vec3 cameraPosition;
        // The model color
        vec4 color;
        // The model's specular color
        vec4 specularColor;
        // The amount of ambient light
        float ambientLight;
        
        // The specular values passed in from the shader
        float specularAmount;
        float specularShininess;
        
        // The lights
        vec3 light;

        out vec4 fragmentColor;

        void main() {
            cameraPosition = vec3(0, 5.0, 10.0);
            color = vec4(1.0, 0.0, 0.0, 1.0);
            specularColor = vec4(1.0, 1.0, 1.0, 1.0);
            ambientLight = 1.0;
            specularAmount = 0.5;
            specularShininess = 50.0;
            light = normalize(vec3(0.0, 5.0, 10.0));

            // Get the direction from the surface to the camera, which is located at
            // (0,-1,0) in clip space. The camera position is hardcoded for convenience.
            vec3 directionToCamera = normalize(cameraPosition - vPosition);

            // Find the vector pointing halfway between the directions
            // of the camera and light from this point on the surface
            vec3 halfwayVector = normalize( directionToCamera + light );

            // Calculate the specular highlight
            float specularBrightness = (
              
              specularAmount * // Adjust the overall amount of specular light
              // Find the angle between the normal and the halfwayVector by taking
              // the dot product, and then raise it to a certain power. The power
              // increases or decreases the size of the bright spot.
              pow(
                max(0.0, dot(vNormal, halfwayVector)),
                specularShininess
              )
            );
            
            // Calculate the brightness of the surface using the lambertian lighting model
            float lightDotProduct = dot( normalize(vNormal), light );
            float surfaceBrightness = max( 0.0, lightDotProduct );

            // fragmentColor = texture(diffuseTexture, vUv);
            
            // Multiply together all of the various light values
            fragmentColor = vec4(texture(diffuseTexture, vUv).xyz * surfaceBrightness + specularColor.xyz * specularBrightness, color.w);
        }
    `;

    const vertexShaderSource = `${getShaderHeader({ floatPrecision, intPrecision })}${vSource}`;
    const fragmentShaderSource = `${getShaderHeader({ floatPrecision, intPrecision })}${fSource}`;
    return { vertexShaderSource, fragmentShaderSource };
};