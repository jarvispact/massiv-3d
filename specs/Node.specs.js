/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import Node from '../src/Node';
import { identityMatrix } from './helpers';

describe('Node', () => {
    it('should create a new instance of a Node', () => {
        const node = new Node();
        expect(node).to.exist;
    });
});
