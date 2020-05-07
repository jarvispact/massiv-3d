import { PerspectiveCamera, Renderable, Transform, UnlitMaterial, WebGL2RenderSystem, World, System, ResizeCanvasEvent, FileLoader, parseObjFile, RawGeometry } from '../lib/massiv-3d.esm.js';

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
    
    const camera = world.registerEntity([new PerspectiveCamera({ translation: [3, 3, 5], aspect: canvas.width / canvas.height })]);

    world.registerEntity([
        new Transform(),
        new Renderable({ material: new UnlitMaterial(), geometry: new RawGeometry(cubeData) }),
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