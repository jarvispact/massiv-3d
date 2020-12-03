import { BoundingBox, Component, System, Transform, Velocity } from '../../../src';
import { world } from '../world';

export const createMovementSystem = (): System => {
    let cache: Array<{name: string, update: (delta: number) => void}> = [];

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const transform = action.payload.getComponentByClass(Transform);
            const velocity = action.payload.getComponentByClass(Velocity);
            const active = action.payload.getComponentByType('Active') as Component<'Active', boolean>;
            const boundingbox = action.payload.getComponentByClass(BoundingBox);
            if (transform && velocity && active) {
                cache.push({
                    name: action.payload.name,
                    update: (delta) => {
                        const vt = velocity.data.translation;
                        if (active.data) {
                            transform.translate(vt[0] * delta, vt[1] * delta, vt[2] * delta).update();
                            if (boundingbox) boundingbox.updateFromTransform(transform);
                        }
                    },
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            cache = cache.filter(item => item.name !== action.payload.name);
        }
    });

    return (delta) => {
        for (let i = 0; i < cache.length; i++) cache[i].update(delta);
    };
};