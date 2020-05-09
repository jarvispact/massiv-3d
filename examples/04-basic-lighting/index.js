import { PerspectiveCamera, Renderable, Transform, UnlitMaterial, WebGL2RenderSystem, World, System, ResizeCanvasEvent, FileLoader, parseObjFile, RawGeometry, DirectionalLight, PhongMaterial } from '../lib/massiv-3d.esm.js';

(async () => {
    const result = await FileLoader.load('../assets/cube/cube.obj').then(parseObjFile);
    const [cubeData] = result.objects;
    
    class RotationSystem extends System {
        update(delta) {
            this.world.getComponentsByType(Transform).forEach(t => t.rotate(0, 15 * delta, 0));
        }
    }
    
    const canvas = document.getElementById('canvas');
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
    
    const world = new World();
    
    world.registerEntity([new DirectionalLight({ direction: [3, 3, 3] })]);
    const camera = world.registerEntity([new PerspectiveCamera({ translation: [0, 3, 5], aspect: canvas.width / canvas.height })]);

    world.registerEntity([
        new Transform(),
        new Renderable({ material: new PhongMaterial({ diffuseColor: [1, 0, 0] }), geometry: new RawGeometry(cubeData) }),
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