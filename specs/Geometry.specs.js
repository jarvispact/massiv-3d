import { expect } from 'chai';
import Geometry from '../src/Geometry';

describe('Geometry', () => {
    it('should create a new instance of a Geometry', () => {
        const geometry = new Geometry();
        expect(geometry instanceof Geometry).to.equal(true);
        expect(geometry.positions).to.eql([]);
        expect(geometry.normals).to.eql([]);
        expect(geometry.uvs).to.eql([]);
        expect(geometry.vertexColors).to.eql([]);
        expect(geometry.positionsSize).to.equal(3);
        expect(geometry.normalsSize).to.equal(3);
        expect(geometry.uvsSize).to.equal(2);
        expect(geometry.vertexColorsSize).to.equal(4);
    });

    it('should return the positions as Float32Array', () => {
        const geometry = new Geometry({ positions: [1, 2, 3] });
        const result = geometry.getPositionsBuffer();
        expect(result).to.eql(new Float32Array([1, 2, 3]));
    });

    it('should return the positions size', () => {
        const geometry = new Geometry();
        const result = geometry.getPositionsBufferSize();
        expect(result).to.eql(3);
    });

    it('should return the normals as Float32Array', () => {
        const geometry = new Geometry({ normals: [1, 2, 3] });
        const result = geometry.getNormalsBuffer();
        expect(result).to.eql(new Float32Array([1, 2, 3]));
    });

    it('should return the normals size', () => {
        const geometry = new Geometry();
        const result = geometry.getNormalsBufferSize();
        expect(result).to.eql(3);
    });

    it('should return the uvs as Float32Array', () => {
        const geometry = new Geometry({ uvs: [1, 2, 3] });
        const result = geometry.getUvsBuffer();
        expect(result).to.eql(new Float32Array([1, 2, 3]));
    });

    it('should return the uvs size', () => {
        const geometry = new Geometry();
        const result = geometry.getUvsBufferSize();
        expect(result).to.eql(2);
    });

    it('should return the vertexColors as Float32Array', () => {
        const geometry = new Geometry({ vertexColors: [1, 2, 3] });
        const result = geometry.getVertexColorsBuffer();
        expect(result).to.eql(new Float32Array([1, 2, 3]));
    });

    it('should return the vertexColors size', () => {
        const geometry = new Geometry();
        const result = geometry.getVertexColorsBufferSize();
        expect(result).to.eql(4);
    });
});
