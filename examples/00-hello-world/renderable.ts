import { Component } from '../../src';

const renderableType = 'Renderable';

type RenderableData = {
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
    colors: number[];
    diffuseMap: WebGLTexture;
};

type Renderable = Component<typeof renderableType, RenderableData>;

const Renderable = class extends Component<typeof renderableType, RenderableData> {
    constructor(diffuseMap: WebGLTexture) {
        super(renderableType, {
            positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            uvs: [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0],
            normals: [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0],
            indices: [0, 1, 2, 0, 2, 3],
            colors: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
            diffuseMap,
        });
    }
}

export default Renderable;