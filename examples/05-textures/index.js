import { PerspectiveCamera, Renderable, Transform, WebGL2RenderSystem, World, System, ResizeCanvasEvent, FileLoader, parseObjFile, RawGeometry, DirectionalLight, PhongMaterial, ImageLoader } from '../lib/massiv-3d.esm.js';

(async () => {
    const [cube, cubeDiffuseMap, cubeSpecularMap, earth, earthDayDiffuseMap, earthNightDiffuseMap, earthSpecularMap] = await Promise.all([
        FileLoader.load('../assets/cube/cube.obj').then(parseObjFile),
        ImageLoader.load('../assets/cube/paving-stone-diffuse-map.jpg'),
        ImageLoader.load('../assets/cube/paving-stone-specular-map.jpg'),
        FileLoader.load('../assets/earth/earth.obj').then(parseObjFile),
        ImageLoader.load('../assets/earth/earth-by-day-diffuse-map.png'),
        ImageLoader.load('../assets/earth/earth-by-night-diffuse-map.png'),
        ImageLoader.load('../assets/earth/earth-specular-map.png'),
    ]);

    const [cubeData] = cube.objects;
    const [earthData] = earth.objects;    
    
    class RotationSystem extends System {
        update(delta) {
            this.world.getComponentsByType(Transform).forEach(t => t.rotate(15 * delta, 15 * delta, 0));
        }
    }
    
    const canvas = document.getElementById('canvas');
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
    
    const world = new World();
    
    world.registerEntity([new DirectionalLight({ direction: [0, 3, 3] })]);
    const camera = world.registerEntity([new PerspectiveCamera({ translation: [0, 3, 8], aspect: canvas.width / canvas.height })]);

    world.registerEntity([
        new Transform(),
        new Renderable({
            material: new PhongMaterial({ diffuseMap: cubeDiffuseMap, specularMap: cubeSpecularMap }),
            geometry: new RawGeometry(cubeData),
        }),
    ]);

    world.registerEntity([
        new Transform({ translation: [-4, 0, 0], scaling: [0.5, 0.5, 0.5] }),
        new Renderable({
            material: new PhongMaterial({ diffuseMap: earthDayDiffuseMap, specularMap: earthSpecularMap }),
            geometry: new RawGeometry(earthData),
        }),
    ]);

    world.registerEntity([
        new Transform({ translation: [4, 0, 0], scaling: [0.5, 0.5, 0.5] }),
        new Renderable({
            material: new PhongMaterial({ diffuseMap: earthNightDiffuseMap, specularMap: earthSpecularMap }),
            geometry: new RawGeometry(earthData),
        }),
    ]);
    
    world.registerSystem(new RotationSystem());
    world.registerRenderSystem(new WebGL2RenderSystem(canvas, camera));
    
    const tick = (now) => {
        world.update(now);
        world.render(now);
        window.requestAnimationFrame(tick);
    };
    
    window.requestAnimationFrame(tick);
    
    window.addEventListener('resize', () => {
        world.publish(new ResizeCanvasEvent({ width: canvas.clientWidth, height: canvas.clientHeight }));
    });
})();