import { expect } from 'chai';
import { Component, Entity } from '../../src'

describe('Entity', () => {
    it('should set components correctly in constructor', () => {
        const component = new Component('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component]);
        expect(entity.components).to.eql([component]);
        expect(entity.componentTypes).to.eql([component.type]);
    });

    it('should add a component correctly', () => {
        const entity = new Entity('TestEntity', [] as Array<Component<string, unknown>>);
        const component = new Component('TestComponent', { foo: 'bar' });
        entity.addComponent(component);
        expect(entity.components).to.eql([component]);
        expect(entity.componentTypes).to.eql([component.type]);
    });

    it('should remove a component by reference', () => {
        const component = new Component('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component]);
        entity.removeComponent(component);
        expect(entity.components).to.eql([]);
        expect(entity.componentTypes).to.eql([]);
    });

    it('should remove a component by type', () => {
        const component = new Component('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component]);
        entity.removeComponentByType(component.type);
        expect(entity.components).to.eql([]);
        expect(entity.componentTypes).to.eql([]);
    });

    it('should only allow one component of a given type in constructor', () => {
        const component1 = new Component('TestComponent', { foo: 'bar' });
        const component2 = new Component('TestComponent', { foo: 'bar' });
        const fn = () => new Entity('TestEntity', [component1, component2]);
        expect(fn).to.throw('a entity can only one component of any type');
    });

    it('should only allow one component of a given type in addComponent', () => {
        const component1 = new Component('TestComponent', { foo: 'bar' });
        const component2 = new Component('TestComponent', { foo: 'bar' });
        const entity = new Entity('TestEntity', [component1]);
        const fn = () => entity.addComponent(component2);
        expect(fn).to.throw('a entity can only one component of any type');
    });
});