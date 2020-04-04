// /* eslint-disable @typescript-eslint/no-empty-function */
import { World, Transform, System, Component, PerspectiveCamera, createShader, createProgram, createVertexArray, createArrayBuffer, createElementArrayBuffer, FpsDebugSystem, UpdateTransformSystem } from '../../src';
import { vec3, mat4 } from 'gl-matrix';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const renderableType = 'Renderable';
type RenderableData = { positions: number[]; indices: number[]; colors: number[] };

const Renderable = class extends Component<typeof renderableType, RenderableData> {
    constructor() {
        super(renderableType, {
            positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            indices: [0, 1, 2, 0, 2, 3],
            colors: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
        });
    }
}

const rotationType = 'Rotation';

type Rotation = Component<typeof rotationType, vec3>;

const Rotation = class extends Component<typeof rotationType, vec3> {
    constructor() {
        super(rotationType, [0, 1, 0]);
    }
}

const vShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    layout(location = 0) in vec3 position;
    layout(location = 1) in vec3 color;

    uniform mat4 mvp;

    out vec3 aColor;

    void main() {
        aColor = color;
        gl_Position = mvp * vec4(position, 1.0);
    }
`.trim();

const fShaderSource = `
    #version 300 es

    precision highp float;
    precision highp int;

    in vec3 aColor;

    out vec4 fragmentColor;

    void main() {
        fragmentColor = vec4(aColor, 1.0);
    }
`.trim();

const RenderSystem = class extends System {
    vertexShader!: WebGLShader;
    fragmentShader!: WebGLShader;
    program!: WebGLProgram;
    vao!: WebGLVertexArrayObject;
    buffers!: WebGLBuffer[];
    indices!: WebGLBuffer;
    uniforms!: { mvp: { location: WebGLUniformLocation | null; value: mat4 } };
    cached!: boolean;

    constructor(world: World) {
        super(world)
        window.addEventListener('unload', () => {
            this.cleanup();
        });
    }

    update(): void {
        const renderable = this.world.getComponentsByType(Renderable)[0];
        const transform = this.world.getComponentsByType(Transform)[0];
        const camera = this.world.getComponentsByType(PerspectiveCamera)[0];

        if (!this.cached) {
            this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
            this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
            this.program = createProgram(gl, this.vertexShader, this.fragmentShader);

            const [vao, buffers] = createVertexArray(gl, () => {
                const positionBuffer = createArrayBuffer(gl, Float32Array.from(renderable.data.positions), 0, 3);
                const colorBuffer = createArrayBuffer(gl, Float32Array.from(renderable.data.colors), 1, 3);
                return [positionBuffer, colorBuffer];
            });

            this.vao = vao;
            this.buffers = buffers;
            this.indices = createElementArrayBuffer(gl, Uint32Array.from(renderable.data.indices));

            this.uniforms = {
                mvp: { location: gl.getUniformLocation(this.program, 'mvp'), value: mat4.create() },
            };

            if (!this.uniforms.mvp.location) {
                throw new Error('could not get uniform location');
            }

            this.cached = true;
            gl.useProgram(this.program);
            gl.bindVertexArray(this.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            camera.update();
            mat4.multiply(this.uniforms.mvp.value, camera.data.viewMatrix, transform.data.modelMatrix);
            mat4.multiply(this.uniforms.mvp.value, camera.data.projectionMatrix, this.uniforms.mvp.value);
            gl.uniformMatrix4fv(this.uniforms.mvp.location, false, this.uniforms.mvp.value);

            // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
            gl.drawElements(gl.TRIANGLES, renderable.data.indices.length, gl.UNSIGNED_INT, 0);
        }
    }

    cleanup(): void {
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        gl.deleteProgram(this.program);
        this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.indices);
    }
}

const RotationSystem = class extends System {
    update(): void {
        const transforms = this.world.getComponentsByType(Transform);
        for (const t of transforms) {
            const rotation = this.world.getComponentsByEntityId(t.entityId).find(c => c.type === Rotation.name) as Rotation;
            t.rotate(rotation.data);
        }
    }
}

const world = new World();
world.registerEntity([new Transform(), new Rotation(), new Renderable()]);
world.registerEntity([new PerspectiveCamera({ position: [0, 0, 2], aspect: canvas.width / canvas.height })]);
world.registerSystem(UpdateTransformSystem);
world.registerSystem(RotationSystem);
world.registerSystem(RenderSystem);
world.registerSystem(FpsDebugSystem);

const tick = (now: number): void => {
    world.update(now);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);