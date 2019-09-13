import { expect } from 'chai';
import Scene from '../../src/core/scene';
import Mesh from '../../src/core/mesh';
import benchmark from '../helper/benchmark';

describe('get-children-recursive', () => {
    it('scene.getChildrenRecursive() with 1700 nodes (3 levels deep)', () => {
        const scene = new Scene();
        const directChilds = [...new Array(500)].map(() => new Mesh());
        directChilds.forEach(child => scene.addChild(child));

        const child1_childs = [...new Array(300)].map(() => new Mesh());
        child1_childs.forEach(child => directChilds[0].addChild(child));

        const child2_childs = [...new Array(300)].map(() => new Mesh());
        child2_childs.forEach(child => directChilds[1].addChild(child));

        const child3_childs = [...new Array(300)].map(() => new Mesh());
        child3_childs.forEach(child => directChilds[2].addChild(child));

        const child4_childs = [...new Array(300)].map(() => new Mesh());
        child4_childs.forEach(child => directChilds[3].addChild(child));
        
        const averageRunTime = benchmark(1000, () => {
            const sceneChildren = scene.getChildrenRecursive();
            expect(sceneChildren.meshes.length).to.equal(1700);
            
        });

        console.log(`scene.getChildrenRecursive() average computation time: ${averageRunTime}ms`);        
        expect(averageRunTime).to.lt(4);
    });
});
