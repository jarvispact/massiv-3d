/* eslint-disable camelcase */
import { expect } from 'chai';
import Node from '../src/node';
import { identityMatrix } from '../spec-helpers';

describe('Node', () => {
    it('should create a new instance of a Node', () => {
        const node = new Node();
        expect(node instanceof Node).to.equal(true);
        expect(node.parent).to.equal(null);
        expect(node.children).to.eql([]);
        expect(node.position).to.eql(Float32Array.from([0, 0, 0]));
        expect(node.scaling).to.eql(Float32Array.from([1, 1, 1]));
        expect(node.quaternion).to.eql(Float32Array.from([0, 0, 0, 1]));
        expect(node.transformDirty).to.eql(false);
        expect(node.modelMatrix).to.eql(identityMatrix);
    });

    it('should add a node as a child of another node and set the parent', () => {
        const parentNode = new Node();
        const childNode = new Node();
        parentNode.addChild(childNode);
        expect(parentNode.children).to.eql([childNode]);
        expect(childNode.parent).to.equal(parentNode);
    });

    it('should get the children of a node', () => {
        const parentNode = new Node();
        const childNode1 = new Node();
        const childNode2 = new Node();
        const childNode3 = new Node();
        parentNode.addChild(childNode1);
        parentNode.addChild(childNode2);
        parentNode.addChild(childNode3);
        const children = parentNode.getChildren();
        expect(children).to.eql([childNode1, childNode2, childNode3]);
    });

    it('should get the children of a node recursively', () => {
        const parentNode = new Node();
        const childNode1 = new Node();
        const childNode2 = new Node();
        const childNode3 = new Node();
        parentNode.addChild(childNode1);
        parentNode.addChild(childNode2);
        parentNode.addChild(childNode3);

        const child1_of_child1 = new Node();
        const child2_of_child1 = new Node();
        childNode1.addChild(child1_of_child1);
        childNode1.addChild(child2_of_child1);

        const thirdLevelChild1 = new Node();
        const thirdLevelChild2 = new Node();
        child1_of_child1.addChild(thirdLevelChild1);
        child1_of_child1.addChild(thirdLevelChild2);

        const children = parentNode.getChildren({ recursive: true });
        expect(children).to.eql([
            childNode1,
            child1_of_child1,
            thirdLevelChild1,
            thirdLevelChild2,
            child2_of_child1,
            childNode2,
            childNode3,
        ]);
    });

    it('should translate a node by the given vec3', () => {
        const node = new Node();
        expect(node.transformDirty).to.equal(false);
        expect(node.position).to.eql(Float32Array.from([0, 0, 0]));
        node.translate(2, 2, 2);
        expect(node.transformDirty).to.equal(true);
        expect(node.position).to.eql(Float32Array.from([2, 2, 2]));
        node.translate(1, 2, 3);
        expect(node.transformDirty).to.equal(true);
        expect(node.position).to.eql(Float32Array.from([3, 4, 5]));
    });

    it('should scale a node by the given vec3', () => {
        const node = new Node();
        expect(node.transformDirty).to.equal(false);
        expect(node.scaling).to.eql(Float32Array.from([1, 1, 1]));
        node.scale(2, 2, 2);
        expect(node.transformDirty).to.equal(true);
        expect(node.scaling).to.eql(Float32Array.from([3, 3, 3]));
        node.scale(1, 2, 3);
        expect(node.transformDirty).to.equal(true);
        expect(node.scaling).to.eql(Float32Array.from([4, 5, 6]));
    });

    it('should rotate a node by the given vec3', () => {
        const node = new Node();
        expect(node.transformDirty).to.equal(false);
        expect(node.quaternion).to.eql(Float32Array.from([0, 0, 0, 1]));
        node.rotate(180, 180, 180);
        expect(node.transformDirty).to.equal(true);

        const quat1 = [
            `${node.quaternion[0]}`.substring(0, 5),
            `${node.quaternion[1]}`.substring(0, 5),
            `${node.quaternion[2]}`.substring(0, 5),
            `${node.quaternion[3]}`.substring(0, 5),
        ];

        expect(quat1).to.eql(['-6.12', '6.123', '-6.12', '1']);

        node.rotate(-180, -180, -180);
        expect(node.transformDirty).to.equal(true);

        const quat2 = [
            `${node.quaternion[0]}`.substring(0, 5),
            `${node.quaternion[1]}`.substring(0, 5),
            `${node.quaternion[2]}`.substring(0, 5),
            `${node.quaternion[3]}`.substring(0, 5),
        ];

        expect(quat2).to.eql(['0', '0', '0', '-1']);
    });

    it('should compute the modelMatrix of a Node', () => {
        const node = new Node();

        node.translate(2, 2, 2);
        node.rotate(90, 180, 240);
        node.scale(2, 2, 2);

        expect(node.modelMatrix).to.eql(identityMatrix);
        node.computeModelMatrix();
        expect(node.modelMatrix).to.not.eql(identityMatrix);
    });

    it('should compute the modelMatrix of a Node and its children', () => {
        const parentNode = new Node();
        const childNode1 = new Node();
        const childNode2 = new Node();
        const childNode3 = new Node();

        parentNode.addChild(childNode1);
        parentNode.addChild(childNode2);
        parentNode.addChild(childNode3);

        parentNode.translate(2, 2, 2);
        parentNode.rotate(90, 180, 240);
        parentNode.scale(2, 2, 2);

        expect(parentNode.modelMatrix).to.eql(identityMatrix);
        expect(childNode1.modelMatrix).to.eql(identityMatrix);
        expect(childNode2.modelMatrix).to.eql(identityMatrix);
        expect(childNode3.modelMatrix).to.eql(identityMatrix);

        parentNode.computeModelMatrix();

        expect(parentNode.modelMatrix).to.not.eql(identityMatrix);
        expect(childNode1.modelMatrix).to.not.eql(identityMatrix);
        expect(childNode2.modelMatrix).to.not.eql(identityMatrix);
        expect(childNode3.modelMatrix).to.not.eql(identityMatrix);
    });

    it('should compute the modelMatrix of a Node and its children recursively', () => {
        const parentNode = new Node();
        const childNode1 = new Node();
        const childNode2 = new Node();
        const childNode3 = new Node();
        const child1_childNode1 = new Node();
        const child2_childNode1 = new Node();
        const child1_childNode2 = new Node();

        childNode1.addChild(child1_childNode1);
        childNode1.addChild(child2_childNode1);
        childNode2.addChild(child1_childNode2);

        parentNode.addChild(childNode1);
        parentNode.addChild(childNode2);
        parentNode.addChild(childNode3);

        parentNode.translate(2, 2, 2);
        parentNode.rotate(90, 180, 240);
        parentNode.scale(2, 2, 2);

        childNode1.translate(3, 3, 3);
        childNode1.translate(45, 90, 45);
        childNode1.scale(3, 3, 3);

        expect(parentNode.modelMatrix).to.eql(identityMatrix);
        expect(childNode1.modelMatrix).to.eql(identityMatrix);
        expect(childNode2.modelMatrix).to.eql(identityMatrix);
        expect(childNode3.modelMatrix).to.eql(identityMatrix);
        expect(child1_childNode1.modelMatrix).to.eql(identityMatrix);
        expect(child2_childNode1.modelMatrix).to.eql(identityMatrix);

        parentNode.computeModelMatrix();

        expect(parentNode.modelMatrix).to.not.eql(identityMatrix);
        expect(childNode1.modelMatrix).to.not.eql(identityMatrix);
        expect(childNode2.modelMatrix).to.not.eql(identityMatrix);
        expect(childNode3.modelMatrix).to.not.eql(identityMatrix);
        expect(child1_childNode1.modelMatrix).to.not.eql(identityMatrix);
        expect(child2_childNode1.modelMatrix).to.not.eql(identityMatrix);

        expect(childNode2.modelMatrix).to.eql(parentNode.modelMatrix);
        expect(child1_childNode2.modelMatrix).to.eql(parentNode.modelMatrix);
        expect(childNode3.modelMatrix).to.eql(parentNode.modelMatrix);

        expect(childNode1.modelMatrix).to.not.eql(parentNode.modelMatrix);
        expect(child1_childNode1.modelMatrix).to.not.eql(parentNode.modelMatrix);
        expect(child2_childNode1.modelMatrix).to.not.eql(parentNode.modelMatrix);
    });

    it('should compute the modelMatrix of a Node recursivley also if nothing has changed', () => {
        const parentNode = new Node();
        const childNode1 = new Node();
        const childNode2 = new Node();
        const child1_childNode1 = new Node();
        const child2_childNode1 = new Node();

        childNode1.addChild(child1_childNode1);
        childNode1.addChild(child2_childNode1);

        parentNode.addChild(childNode1);
        parentNode.addChild(childNode2);

        expect(parentNode.modelMatrix).to.eql(identityMatrix);
        expect(childNode1.modelMatrix).to.eql(identityMatrix);
        expect(childNode2.modelMatrix).to.eql(identityMatrix);
        expect(child1_childNode1.modelMatrix).to.eql(identityMatrix);
        expect(child2_childNode1.modelMatrix).to.eql(identityMatrix);

        parentNode.computeModelMatrix();

        expect(parentNode.modelMatrix).to.eql(identityMatrix);
        expect(childNode1.modelMatrix).to.eql(identityMatrix);
        expect(childNode2.modelMatrix).to.eql(identityMatrix);
        expect(child1_childNode1.modelMatrix).to.eql(identityMatrix);
        expect(child2_childNode1.modelMatrix).to.eql(identityMatrix);
    });
});
