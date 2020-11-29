import { BoundingBox, Component, System, Transform } from '../../../src';
import { world } from '../world';

export const createUpdateBoundingBoxSystem = (): System => {
    let cache: Array<{name: string, update: () => void}> = [];

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const transform = action.payload.getComponentByClass(Transform);
            const boundingbox = action.payload.getComponentByClass(BoundingBox);
            const active = action.payload.getComponentByType('Active') as Component<'Active', boolean>;
            if (transform && boundingbox && active) {
                cache.push({
                    name,
                    update: () => {
                        if (active.data) boundingbox.updateWorldPosition(transform);
                    },
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            cache = cache.filter(item => item.name !== action.payload.name);
        }
    });

    return () => {
        for (let i = 0; i < cache.length; i++) cache[i].update();
    };
};