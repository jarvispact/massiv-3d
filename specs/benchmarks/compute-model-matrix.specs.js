import { expect } from 'chai';
import Scene from '../../src/core/scene';
import Mesh from '../../src/core/mesh';
import benchmark from '../helper/benchmark';

describe('compute-model-matrix', () => {
    it('scene.computeModelMatrix() with 7000 nodes (3 levels deep)', () => {
        const scene = new Scene();
        const directChilds = [...new Array(1000)].map(() => new Mesh());
        directChilds.forEach(child => scene.addChild(child));

        const child1_childs = [...new Array(1500)].map(() => new Mesh());
        child1_childs.forEach(child => directChilds[0].addChild(child));

        const child2_childs = [...new Array(1500)].map(() => new Mesh());
        child2_childs.forEach(child => directChilds[1].addChild(child));

        const child3_childs = [...new Array(1500)].map(() => new Mesh());
        child3_childs.forEach(child => directChilds[2].addChild(child));

        const child4_childs = [...new Array(1500)].map(() => new Mesh());
        child4_childs.forEach(child => directChilds[3].addChild(child));
        
        const averageRunTime = benchmark(1000, () => {
            scene.rotate(0, 1, 0);
            scene.translate(0, 10, 0);
            directChilds[0].translate(10, 0, 0);
            directChilds[1].translate(-10, 0, 0);
            directChilds[2].translate(0, 0, 10);
            directChilds[3].translate(0, 0, -10);
            scene.computeModelMatrix();
        });

        console.log(`scene.computeModelMatrix() average computation time: ${averageRunTime}ms`);        
        expect(averageRunTime).to.lt(4);
    });
});
