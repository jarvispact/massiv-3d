import { degreesToRadians, Nullable, System, World } from '../../../src';
import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';

type RotationSystemArgs = {
    world: World;
};

type CachedItem = {
    entityName: string;
    transform: Transform;
    rotation: Rotation;
};

export const createRotationSystem = ({ world }: RotationSystemArgs): System => {
    const cache: Array<Nullable<CachedItem>> = [];

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const transform = action.payload.getComponentByClass(Transform);
            const rotation = action.payload.getComponentByClass(Rotation);
            if (transform && rotation) cache.push({ entityName: action.payload.name, transform, rotation });
        } else if (action.type === 'REMOVE-ENTITY') {
            for (let i = 0; i < cache.length; i++) {
                const cachedItem = cache[i];
                if (cachedItem && cachedItem.entityName === action.payload.name) {
                    cache[i] = null;
                }
            }
        }
    });

    return (delta) => {
        for (let i = 0; i < cache.length; i++) {
            const cachedItem = cache[i];
            if (cachedItem) {
                cachedItem.transform.rotateX(degreesToRadians(cachedItem.rotation.data[0] * delta));
                cachedItem.transform.rotateY(degreesToRadians(cachedItem.rotation.data[1] * delta));
                cachedItem.transform.rotateZ(degreesToRadians(cachedItem.rotation.data[2] * delta));
            }
        }
    };
};