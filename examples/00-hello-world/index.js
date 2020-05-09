import { PerspectiveCamera, Renderable, Transform, UnlitMaterial, WebGL2RenderSystem, World, QuadGeometry } from '../lib/massiv-3d.esm.js';

const canvas = document.getElementById('canvas');
canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;

const world = new World();

const camera = world.registerEntity([new PerspectiveCamera({ translation: [0, 0, 2], aspect: canvas.width / canvas.height })]);
world.registerEntity([new Transform(), new Renderable({ material: new UnlitMaterial(), geometry: new QuadGeometry() })]);

world.registerRenderSystem(new WebGL2RenderSystem(canvas, camera));

window.requestAnimationFrame((now) => {
    world.update(now);
    world.render(now);
});