import { expect } from 'chai';
import { World, createComponent, Component } from '../../src/index';

describe('entity.ts', () => {
    describe('entities', () => {
        it('should create a new entity', () => {
            const world = new World();
            const entity = world.registerEntity([
                createComponent('SomeComponentType', { foo: 'bar' }),
                createComponent('AnotherComponentType', { bar: 'foo' }),
            ]);
    
            expect(entity).to.exist;
            expect(entity.id).to.exist;
            expect(entity.world).to.exist;
        });
    });

    describe('components', () => {
        it('should create components as plain objects', () => {
            const world = new World();
            const entity = world.registerEntity([
                createComponent('SomeComponentType', { foo: 'bar' }),
                createComponent('AnotherComponentType', { bar: 'foo' }),
            ]);
            expect(entity.getComponents()).to.eql([
                { entityId: entity.id, type: 'SomeComponentType', data: { foo: 'bar' } },
                { entityId: entity.id, type: 'AnotherComponentType', data: { bar: 'foo' } },
            ]);
        });
    
        it('should create components as class', () => {
            const world = new World();
            const entity = world.registerEntity([
                new Component('SomeComponentType', { foo: 'bar' }),
                new Component('AnotherComponentType', { bar: 'foo' }),
            ]);
    
            expect(entity.getComponents()).to.eql([
                { entityId: entity.id, type: 'SomeComponentType', data: { foo: 'bar' } },
                { entityId: entity.id, type: 'AnotherComponentType', data: { bar: 'foo' } },
            ]);
        });
    
        it('should create components as class with inheritance', () => {
            const CustomComponent = class extends Component {
                constructor(data: unknown) {
                    super('CustomComponentType', data);
                }
    
                setData(data: unknown): void {
                    this.data = data;
                }
            };
    
            const world = new World();
            const entity = world.registerEntity([
                new CustomComponent({ foo: 'bar' }),
                new Component('SomeComponentType', { bar: 'foo' }),
            ]);
    
            expect(entity.getComponents()).to.eql([
                { entityId: entity.id, type: 'CustomComponentType', data: { foo: 'bar' } },
                { entityId: entity.id, type: 'SomeComponentType', data: { bar: 'foo' } },
            ]);
        });
    });
});