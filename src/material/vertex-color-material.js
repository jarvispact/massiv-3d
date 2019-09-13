import Material from './material';

const getUniformsDeclaration = (uniforms) => {
    const keys = Object.keys(uniforms).filter(key => uniforms[key]);
    return keys.map(key => `uniform ${uniforms[key]} ${key};`).join('\n');
};

class VertexColorMaterial extends Material {
    getShaderData({ shaderLayoutLocations }) {
        const uniforms = {
            vertexShader: {
                mvp: 'mat4',
            },
            fragmentShader: {
            },
        };

        const vertexShaderSource = `
            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.vertexColor}) in vec4 vertexColor;

            ${getUniformsDeclaration(uniforms.vertexShader)}

            out vec4 vColor;

            void main() {
                vColor = vertexColor;
                gl_Position = mvp * vec4(position, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;
            precision highp int;

            in vec4 vColor;
            out vec4 fragmentColor;

            void main() {
                fragmentColor = vColor;
            }
        `;

        const vertexShaderSourceCode = `${this.getShaderVersion()}${vertexShaderSource}`;
        const fragmentShaderSourceCode = `${this.getShaderVersion()}${fragmentShaderSource}`;

        return {
            vertexShaderSourceCode,
            fragmentShaderSourceCode,
            uniforms,
        };
    }

    clone() {
        const clone = new VertexColorMaterial();
        clone.setIndices([...this.indices]);
        return clone;
    }
}

export default VertexColorMaterial;
