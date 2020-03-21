import { mat4 } from 'gl-matrix';
import { expect } from 'chai';
import { World, Transform, UpdateTransformSystem } from '../../src/index';

describe('update-transform-system.ts', () => {
    it('should update the modelMatrix on every Transform Component', () => {
        const world = new World();
        const t1 = new Transform({ position: [1, 1, 1] });
        const t2 = new Transform({ position: [1, 1, 1] });
        const t3 = new Transform({ position: [1, 1, 1] });
        world.registerEntity([t1]);
        world.registerEntity([t2]);
        world.registerEntity([t3]);
        world.registerSystem(UpdateTransformSystem);

        expect(t1.data.dirty).to.be.true;
        expect(t2.data.dirty).to.be.true;
        expect(t3.data.dirty).to.be.true;

        const t1MM = mat4.clone(t1.data.modelMatrix);
        const t2MM = mat4.clone(t2.data.modelMatrix);
        const t3MM = mat4.clone(t3.data.modelMatrix);

        world.update(1);
        
        expect(t1.data.dirty).to.be.false;
        expect(t2.data.dirty).to.be.false;
        expect(t3.data.dirty).to.be.false;

        expect(t1.data.modelMatrix).to.not.eql(t1MM);
        expect(t2.data.modelMatrix).to.not.eql(t2MM);
        expect(t3.data.modelMatrix).to.not.eql(t3MM);
    });

    it('should react to registerEntity and removeEntity Events', () => {
        const world = new World();
        const t1 = new Transform({ position: [1, 1, 1] });
        const t2 = new Transform({ position: [1, 1, 1] });
        const t3 = new Transform({ position: [1, 1, 1] });
        const e1 = world.registerEntity([t1]);
        const system = world.registerSystem(UpdateTransformSystem) as UpdateTransformSystem;

        expect(system.transforms).to.eql([t1]);
        const e2 = world.registerEntity([t2]);
        expect(system.transforms).to.eql([t1, t2]);
        const e3 = world.registerEntity([t3]);

        expect(system.transforms).to.eql([t1, t2, t3]);
        world.removeEntity(e1);
        expect(system.transforms).to.eql([t2, t3]);
        world.removeEntity(e3);
        expect(system.transforms).to.eql([t2]);
        world.removeEntity(e2);
        expect(system.transforms).to.eql([]);
    });
});