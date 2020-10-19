import { Component } from '../../src';

export type GeometryData = {
    positions: number[];
    indices: number[];
    colors: number[];
};

export const Geometry = class extends Component<'Geometry', GeometryData> {
    constructor(data: Partial<GeometryData> = {}) {
        super('Geometry', {
            positions: data.positions || [
                -0.5, -0.5, 0,
                0.5, -0.5, 0,
                0.5, 0.5, 0,
                -0.5, 0.5, 0,
            ],
            indices: data.indices || [
                0, 1, 2,
                0, 2, 3,
            ],
            colors: data.colors || [
                1, 0, 0,
                0, 0, 1,
                1, 1, 0,
                0, 1, 1,
            ],
        });
    }
}