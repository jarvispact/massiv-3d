import { System, Transform } from '../../../src';
import { AnimationComponent } from '../misc';
import { world } from '../world';

type CachedEntity = {
    name: string;
    update: (delta: number) => void;
};

export const createAnimationSystem = (): System => {
    let cache: Array<CachedEntity> = [];

    world.subscribe((action) => {
        if (action.type === 'ADD-ENTITY') {
            const animation = action.payload.getComponentByType('Animation') as AnimationComponent;
            const transform  = action.payload.getComponentByClass(Transform);
            if (animation) {
                cache.push({
                    name: action.payload.name,
                    update: (delta) => {
                        if (animation.isRunning()) {
                            transform.setTranslationZ(animation.getValue() * 0.05);
                            animation.updateTime(delta * 4);
                        }
                    }
                });
            }
        } else if (action.type === 'REMOVE-ENTITY') {
            cache = cache.filter(item => item.name !== action.payload.name);
        }
    });

    return (delta) => {
        for (let i = 0; i < cache.length; i++) {
            cache[i].update(delta);
        }
    };
};