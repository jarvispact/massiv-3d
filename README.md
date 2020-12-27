# massiv-3d
a utility first, ecs based, engine to create animations, simulations and games

## goal
every abstraction comes with a cost in runtime-performance and memory-allocation. the goal of this project is **not** to abstract away the rendering pipeline, but to give you useful utilities to create high-performance renderings for your animations, simulations and games and by reducing the boilerplate code.

## the ecs system
this project uses a very basic implementation of an ecs system, but it does not follow the strict definition where i think it results in more complex code or bad performance.

### actually working, but not very useful code to get an idea of the ecs system:

```ts
const world = new World();

// in its most basic form, a component is just a object with type and data property
const createPosition = (x: number, y: number, z: number) => {
    return { type: 'Position', data: [x, y, z] };
};

// a entity is something that has an identity in your world
// all of the data that describes the entity is defined by its components
const player = new Entity('Player', [
    createPosition(0, 0, 0)
]);

// a system is just a function that will get called every time
// you call world.update()
const consoleRenderSystem = () => {
    const entitiesWithPosition = world.queryEntities(['Position']);
    console.log(`count of entities with a position component: ${entitiesWithPosition.length}`);
};

world.addSystem(consoleRenderSystem);
world.addEntity(player);

// typically you call world.update() inside of the requestAnimationFrame callback
const tick = (time: number) => {
    world.update(time);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);
```

### some useful information about the custom ecs implementation:
- the name of an `Entity` must be unique in one `World`
- a `Entity` can only have 1 `Component` of any given type

## Important Info
**this project is work in progress**. It does not export a set of components or systems that work out of the box. I havent found the right abstraction until now, because different projects have different requirements, and i found myself always writing systems from scratch to improve on performance, memory-usage and multi-threading for a given project. Once i find `Components` or `Systems` that may be used across different projects, i will add it to the export of this library. Some Components and Systems that are planned to be exported very soon are:

- Components
    - Geometry
    - Transform
    - PerspectiveCamera
    - OrthographicCamera
- Systems
    - FirstPersonCameraMovementSystem
    - OrbitCameraMovementSystem

## Examples
the `examples` folder holds basic, but also more complex components and systems, that shows a possible usage of the library in more depth. the quick start guide is:

1. clone this repo
2. `npm i`
3. `npm run example:XX` where XX stands for: `example:01`, `example:02`, ...

try the examples in order to get a better idea of the library and the concepts itself