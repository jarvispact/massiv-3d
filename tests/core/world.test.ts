import { expect } from 'chai';
import { World, createComponent, System, UpdateableSystem } from '../../src/index';
import { WorldEvent, createEvent } from '../../src/core/event';

describe('world.ts', () => {
    describe('registerEntity', () => {
        it('should register a entity and set its components in the world', () => {
            const world = new World();
            const entity1 = world.registerEntity([
                createComponent('SomeComponentType', { foo: 'bar' }),
                createComponent('AnotherComponentType', { bar: 'foo' }),
            ]);
            const entity2 = world.registerEntity([
                createComponent('SomeComponentType', { foo: 'bar' }),
                createComponent('AnotherComponentType', { bar: 'foo' }),
            ]);
    
            expect(world.componentsByType.SomeComponentType.length).to.equal(2);
            expect(world.componentsByType.AnotherComponentType.length).to.equal(2);
            expect(world.componentsByEntityId[entity1.id].length).to.equal(2);
            expect(world.componentsByEntityId[entity2.id].length).to.equal(2);
        });

        it('should not allow 2 components of the same type for the same entity', () => {
            const world = new World();

            const fn = (): void => {
                world.registerEntity([
                    createComponent('SomeComponentType', { foo: 'bar' }),
                    createComponent('SomeComponentType', { foo: 'bar' }),
                ]);
            };

            expect(fn).to.throw('a entity cannot have more than one component of the same type');
        });
    });

    describe('removeEntity', () => {
        it('should remove a entity and all its components from the world', () => {
            const world = new World();
            const entity1 = world.registerEntity([
                createComponent('SomeComponentType', { foo: 'bar' }),
                createComponent('AnotherComponentType', { bar: 'foo' }),
            ]);
            const entity2 = world.registerEntity([
                createComponent('SomeComponentType', { foo: 'bar' }),
                createComponent('AnotherComponentType', { bar: 'foo' }),
            ]);
    
            expect(world.componentsByType.SomeComponentType.length).to.equal(2);
            expect(world.componentsByType.AnotherComponentType.length).to.equal(2);
            expect(world.componentsByEntityId[entity1.id].length).to.equal(2);
            expect(world.componentsByEntityId[entity2.id].length).to.equal(2);

            world.removeEntity(entity1);

            expect(world.componentsByType.SomeComponentType.length).to.equal(1);
            expect(world.componentsByType.AnotherComponentType.length).to.equal(1);
            expect(world.componentsByEntityId[entity1.id].length).to.equal(0);
            expect(world.componentsByEntityId[entity2.id].length).to.equal(2);

            world.removeEntity(entity2);

            expect(world.componentsByType.SomeComponentType.length).to.equal(0);
            expect(world.componentsByType.AnotherComponentType.length).to.equal(0);
            expect(world.componentsByEntityId[entity1.id].length).to.equal(0);
            expect(world.componentsByEntityId[entity2.id].length).to.equal(0);
        });
    });

    describe('registerSystem', () => {
        it('should register a system on the world', () => {
            const world = new World();
            world.registerSystem(System);
            world.registerSystem(UpdateableSystem);
            expect(world.systems.length).to.equal(1);
            expect(world.updateableSystems.length).to.equal(1);
        });
    });

    describe('removeSystem', () => {
        it('should remove a system from the world', () => {
            const world = new World();
            const system1 = world.registerSystem(System);
            const system2 = world.registerSystem(UpdateableSystem);

            expect(world.systems.length).to.equal(1);
            expect(world.updateableSystems.length).to.equal(1);

            world.removeSystem(system1);

            expect(world.systems.length).to.equal(0);
            expect(world.updateableSystems.length).to.equal(1);

            world.removeSystem(system2);

            expect(world.systems.length).to.equal(0);
            expect(world.updateableSystems.length).to.equal(0);
        });

        it('should call the cleanup function before removing the system', () => {
            const world = new World();

            let cleanupCalled = false;
            
            const CustomSystem = class extends System {
                cleanup(): void {
                    cleanupCalled = true;
                }
            }

            const system = world.registerSystem(CustomSystem);
            world.removeSystem(system);
            expect(cleanupCalled).to.be.true;
        });
    });

    describe('pub/sub', () => {
        it('should deliver events to all subscribed systems', () => {
            const world = new World();

            const e = createEvent('SomeEvent', { foo: 'bar' });
            let deliveredEvent = null;

            const CustomSystem = class extends System {
                constructor(world: World) {
                    super(world);
                    world.subscribe(this, ['SomeEvent']);
                }
                onEvent(event: WorldEvent): void {
                    deliveredEvent = event;
                }
            }

            world.registerSystem(CustomSystem);
            world.publish(e);

            expect(deliveredEvent).to.exist;
            expect(deliveredEvent).to.equal(e);
        });
    });
});