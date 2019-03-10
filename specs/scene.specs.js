/* eslint-disable camelcase */
import { expect } from 'chai';
import Scene from '../src/scene';
import Mesh from '../src/mesh';

describe('Scene', () => {
    it('should get the children of a scene', () => {
        const parentNode = new Scene();
        const childMesh1 = new Mesh();
        const childMesh2 = new Mesh();
        const childMesh3 = new Mesh();
        parentNode.addChild(childMesh1);
        parentNode.addChild(childMesh2);
        parentNode.addChild(childMesh3);
        const { meshes } = parentNode.getChildren();
        expect(meshes).to.eql([childMesh1, childMesh2, childMesh3]);
    });

    it('should get the children of a scene recursively', () => {
        const parentNode = new Scene();
        const childMesh1 = new Mesh();
        const childMesh2 = new Mesh();
        const childMesh3 = new Mesh();
        parentNode.addChild(childMesh1);
        parentNode.addChild(childMesh2);
        parentNode.addChild(childMesh3);

        const child1_of_child1 = new Mesh();
        const child2_of_child1 = new Mesh();
        childMesh1.addChild(child1_of_child1);
        childMesh1.addChild(child2_of_child1);

        const thirdLevelChild1 = new Mesh();
        const thirdLevelChild2 = new Mesh();
        child1_of_child1.addChild(thirdLevelChild1);
        child1_of_child1.addChild(thirdLevelChild2);

        const { meshes } = parentNode.getChildren({ recursive: true });
        expect(meshes).to.eql([
            childMesh1,
            child1_of_child1,
            thirdLevelChild1,
            thirdLevelChild2,
            child2_of_child1,
            childMesh2,
            childMesh3,
        ]);
    });
});
