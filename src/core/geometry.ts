type GeometryData = {
    positions?: number[];
    uvs?: number[];
    normals?: number[];
    indices?: number[];
    colors?: number[];
};

export class Geometry {
    positions: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
    colors: number[];

    constructor(args: GeometryData = {}) {
        this.positions = args.positions || [];
        this.uvs = args.uvs || [];
        this.normals = args.normals || [];
        this.indices = args.indices || [];
        this.colors = args.colors || [];
    }
}