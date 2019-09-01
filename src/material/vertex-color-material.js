import Material from './material';

class VertexColorMaterial extends Material {
    constructor() {
        super();
    }

    getVertexShaderSourceCode({ shaderLayoutLocations }) {
        const vertexShaderSourceCode = `
            precision highp float;
            precision highp int;

            layout(location = ${shaderLayoutLocations.vertex}) in vec3 position;
            layout(location = ${shaderLayoutLocations.vertexColor}) in vec4 vertexColor;

            uniform mat4 mvp;

            out vec4 vColor;

            void main() {
                vColor = vertexColor;
                gl_Position = mvp * vec4(position, 1.0);
            }
        `;

        return `${this.getShaderVersion()}${vertexShaderSourceCode}`;
    }

    getFragmentShaderSourceCode() {
        const fragmentShaderSourceCode = `
            precision highp float;
            precision highp int;

            in vec4 vColor;
            out vec4 fragmentColor;

            void main() {
                fragmentColor = vColor;
            }
        `;

        return `${this.getShaderVersion()}${fragmentShaderSourceCode}`;
    }
}

export default VertexColorMaterial;
