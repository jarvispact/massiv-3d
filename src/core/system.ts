import { World } from './world';

export interface System {
    world: World;
}

export interface SystemClass {
    new(world: World): System | UpdateableSystem;
}

export const System = class implements System {
    world: World;

    constructor(world: World) {
        this.world = world;
    }
}

export interface UpdateableSystem extends System {
    onUpdate(delta: number): void;
}

export const UpdateableSystem = class extends System implements UpdateableSystem {
    constructor(world: World) {
        super(world);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUpdate(delta: number): void {
        console.log('Method not implemented');
    }
}