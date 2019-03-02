import { expect } from 'chai';
import Node from '../src/node';
import Camera from '../src/camera';
import PerspectiveCamera from '../src/perspective-camera';
import { identityMatrix } from '../spec-helpers';
import { copyMat4, createMat4 } from '../utils/math-utils';

describe('PerspectiveCamera', () => {
    it('should create a new instance of a PerspectiveCamera', () => {
        const camera = new PerspectiveCamera(65, 1920 / 1080, 0.1, 100);
        expect(camera instanceof Node).to.equal(true);
        expect(camera instanceof Camera).to.equal(true);
        expect(camera instanceof PerspectiveCamera).to.equal(true);
        expect(camera.upVector).to.eql(Float32Array.from([0, 1, 0]));
        expect(camera.viewMatrix).to.eql(identityMatrix);
        expect(camera.projectionMatrix).to.not.eql(identityMatrix);
        expect(camera.fov).to.equal(65);
        expect(camera.aspect).to.equal(1920 / 1080);
        expect(camera.near).to.equal(0.1);
        expect(camera.far).to.equal(100);
    });

    it('should have a lookAt function', () => {
        const camera = new PerspectiveCamera(65, 1920 / 1080, 0.1, 100);
        expect(camera.viewMatrix).to.eql(identityMatrix);
        camera.lookAt(5, 3, 2);
        expect(camera.viewMatrix).to.not.eql(identityMatrix);
    });

    it('should have a updateProjectionMatrix function', () => {
        const camera = new PerspectiveCamera(65, 1920 / 1080, 0.1, 100);
        const projectionMatrixCopy = copyMat4(createMat4(), camera.projectionMatrix);
        expect(projectionMatrixCopy).to.not.eql(identityMatrix);
        camera.updateProjectionMatrix(45, 4 / 3, 1, 1000);
        expect(camera.projectionMatrix).to.not.eql(projectionMatrixCopy);
    });
});
