import { expect } from 'chai';
import { Component, Entity } from '../../src'

const createComponent = <Type extends string, Data extends unknown>(type: Type, data: Data) => ({ type, data });

describe('Entity', () => {
    it('should set components correctly on entity creation', () => {
        const component = createComponent('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component]);
        expect(entity.getComponentByType('TestComponent')).to.eql(component);
        expect(entity.getComponentTypes()).to.eql([component.type]);
    });

    it('should add a component correctly', () => {
        const entity = new Entity('TestEntity', [] as Array<Component<string, unknown>>);
        const component = createComponent('TestComponent', { foo: 'bar' });
        entity.addComponent(component);
        expect(entity.getComponentByType('TestComponent')).to.eql(component);
        expect(entity.getComponentTypes()).to.eql([component.type]);
    });

    it('should remove a component by type', () => {
        const component = createComponent('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component]);
        entity.removeComponentByType('TestComponent');
        expect(entity.getComponentByType('TestComponent')).to.be.undefined;
        expect(entity.getComponentTypes()).to.eql([]);
    });

    it('should only allow one component of a given type at creation time', () => {
        const component1 = createComponent('TestComponent', { foo: 'bar' });
        const component2 = createComponent('TestComponent', { foo: 'bar' });
        const fn = () => new Entity('TestEntity', [component1, component2]);
        expect(fn).to.throw('a entity can only one component of any type');
    });

    it('should only allow one component of a given type in addComponent', () => {
        const component1 = createComponent('TestComponent', { foo: 'bar' });
        const component2 = createComponent('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component1]);
        const fn = () => entity.addComponent(component2);
        expect(fn).to.throw('a entity can only one component of any type');
    });
});