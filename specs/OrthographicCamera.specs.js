import { expect } from 'chai';
import Node from '../src/node';
import Camera from '../src/camera';
import OrthographicCamera from '../src/orthographic-camera';
import { identityMatrix } from '../spec-helpers';
import { copyMat4, createMat4 } from '../utils/math-utils';

describe('OrthographicCamera', () => {
    it('should create a new instance of a OrthographicCamera', () => {
        const camera = new OrthographicCamera(-50, 50, -50, 50, 0.1, 100);
        expect(camera instanceof Node).to.equal(true);
        expect(camera instanceof Camera).to.equal(true);
        expect(camera instanceof OrthographicCamera).to.equal(true);
        expect(camera.upVector).to.eql(Float32Array.from([0, 1, 0]));
        expect(camera.viewMatrix).to.eql(identityMatrix);
        expect(camera.projectionMatrix).to.not.eql(identityMatrix);
        expect(camera.left).to.equal(-50);
        expect(camera.right).to.equal(50);
        expect(camera.bottom).to.equal(-50);
        expect(camera.top).to.equal(50);
        expect(camera.near).to.equal(0.1);
        expect(camera.far).to.equal(100);
    });

    it('should have a lookAt function', () => {
        const camera = new OrthographicCamera(-50, 50, -50, 50, 0.1, 100);
        expect(camera.viewMatrix).to.eql(identityMatrix);
        camera.lookAt(5, 3, 2);
        expect(camera.viewMatrix).to.not.eql(identityMatrix);
    });

    it('should have a updateProjectionMatrix function', () => {
        const camera = new OrthographicCamera(-50, 50, -50, 50, 0.1, 100);
        const projectionMatrixCopy = copyMat4(createMat4(), camera.projectionMatrix);
        expect(projectionMatrixCopy).to.not.eql(identityMatrix);
        camera.updateProjectionMatrix(-100, 100, -100, 100, 1, 1000);
        expect(camera.projectionMatrix).to.not.eql(projectionMatrixCopy);
    });
});
