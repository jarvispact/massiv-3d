import { degreesToRadians, Nullable, System, World } from '../../../src';
import { Transform } from '../components/transform';

type RotationSystemArgs = {
    world: World;
};

type CachedItem = {
    entityName: string;
    transform: Transform;
};

export const createRotationSystem = ({ world }: RotationSystemArgs): System => {
    const cache: Array<Nullable<CachedItem>> = [];

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const transform = world.getComponent(action.payload, Transform);
            if (transform) cache.push({ entityName: action.payload, transform });
        } else if (action.type === 'REMOVE-ENTITY') {
            for (let i = 0; i < cache.length; i++) {
                const cachedItem = cache[i];
                if (cachedItem && cachedItem.entityName === action.payload) {
                    cache[i] = null;
                }
            }
        }
    });

    return (delta) => {
        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) cachedItem.transform.rotateY(degreesToRadians(90) * delta);
        }
    };
};