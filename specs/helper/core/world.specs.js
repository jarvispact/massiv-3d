import { expect } from 'chai';
import World from '../../../src/core/world';
import Transform3D from '../../../src/components/transform-3d';
import benchmark from '../benchmark';

describe('world.js benchmarks', () => {
    it('get components by entity id', () => {
        const world = new World();

        const entityIds = [...new Array(1000)].map(() => {
            const entity = world.createEntity([new Transform3D()]);
            return entity.id;
        });

        const getComponentsForEntities = () => entityIds.map(entityId => world.components.find(c => c.entityId === entityId));

        const componentsIndexedByEntityId = world.components.reduce((accum, component) => {
            accum[component.id] = component;
            return accum;
        }, {});

        const getComponentsForEntities2 = () => entityIds.map(entityId => componentsIndexedByEntityId[entityId]);

        const benchmark1 = benchmark(100, getComponentsForEntities);
        const benchmark2 = benchmark(100, getComponentsForEntities2);
        console.log({ benchmark1, benchmark2 });
    });

    it('compute modelmatrix', () => {
        const world = new World();

        [...new Array(1000)].map(() => {
            const entity = world.createEntity([new Transform3D()]);
            return entity.id;
        });

        const computeModelMatrix = () => {
            for (let i = 0; i < world.components.length; i++) {
                const component = world.components[i];
                if (component instanceof Transform3D) component.computeModelMatrix();
            }
        };


        const benchmark1 = benchmark(100, computeModelMatrix);
        console.log({ benchmark1 });
    });
});
