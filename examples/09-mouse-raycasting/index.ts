import { mat4, vec3, vec4 } from 'gl-matrix';
import { Entity, FileLoader, MouseInput, Nullable, parseObjFile, World } from '../../src';
import { BoundingBox } from './components/bounding-box';
import { Geometry } from './components/geometry';
import { LineGeometry } from './components/line-geometry';
import { Material } from './components/material';
import { PerspectiveCamera } from './components/perspective-camera';
import { Transform } from './components/transform';
import { createMouseRayPickingSystem } from './systems/mouse-ray-picking-system';
import { createRenderSystem } from './systems/render-system';
import { createRotationSystem } from './systems/rotation-system';
import { createTrackballCameraControlSystem } from './systems/trackball-camera-system';

// https://github.com/stackgl/ray-aabb-intersection
// https://github.com/mattdesl/ray-sphere-intersection

function intersection (out: vec3, ro: vec3, rd: vec3, aabb: BoundingBox): Nullable<vec3> {
    const d = distance(ro, rd, aabb)
    if (d === Infinity) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      out = null;
    } else {
      for (let i = 0; i < ro.length; i++) {
        out[i] = ro[i] + rd[i] * d
      }
    }
  
    return out
}
  
  function distance (ro: vec3, rd: vec3, aabb: BoundingBox) {
    const dims = ro.length
    let lo = -Infinity
    let hi = +Infinity
  
    for (let i = 0; i < dims; i++) {
        const min = aabb.data.min;
        const max = aabb.data.max;
      let dimLo = (min[i] - ro[i]) / rd[i]
      let dimHi = (max[i] - ro[i]) / rd[i]
  
      if (dimLo > dimHi) {
        const tmp = dimLo
        dimLo = dimHi
        dimHi = tmp
      }
  
      if (dimHi < lo || dimLo > hi) {
        return Infinity
      }
  
      if (dimLo > lo) lo = dimLo
      if (dimHi < hi) hi = dimHi
    }
  
    return lo > hi ? Infinity : lo
  }

(async () => {
    const [plane] = await FileLoader.load('./assets/plane.obj').then(parseObjFile);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const world = new World();

    const mouseInput = new MouseInput(canvas);
    mouseInput.onButtonDown((event) => {
        if (event.button === MouseInput.BUTTON.PRIMARY) {
            const camera = (world.getEntity('Camera') as Entity).getComponentByClass(PerspectiveCamera) as PerspectiveCamera;
            const entities = world.queryEntities(['BoundingBox']);
            console.log({ entities });

            const x = mouseInput.getMouseX() / canvas.width * 2 - 1;
            const y = 1 - mouseInput.getMouseY() / canvas.height * 2;
            const vec4Clip = vec4.fromValues(x, y, -1, 1);

            const vec4Eye = vec4.create();
            const matInvProj = mat4.create();
            mat4.invert(matInvProj, camera.data.projectionMatrix);
            vec4.transformMat4(vec4Eye, vec4Clip, matInvProj);
            vec4Eye[2] = -1;
            vec4Eye[3] = 0.0;

            const vec4World = vec4.create();
            const cameraWorld = mat4.create();
            mat4.invert(cameraWorld, camera.data.viewMatrix);
            vec4.transformMat4(vec4World, vec4Eye, cameraWorld);

            const ray = vec3.fromValues(vec4World[0], vec4World[1], vec4World[2]);
            vec3.normalize(ray, ray);

            const rayStart	= vec3.fromValues(cameraWorld[12], cameraWorld[13], cameraWorld[14]);
            const rayEnd = vec3.clone(rayStart);

            const scaled = vec3.create();
            vec3.scale(scaled, ray, 20);
            vec3.add(rayEnd, rayEnd, scaled);

            world.addEntity(new Entity(`Ray-${Math.random()}`, [
                new LineGeometry({ positions: [rayStart[0], rayStart[1], rayStart[2], rayEnd[0], rayEnd[1], rayEnd[2]] }),
            ]));

            entities.forEach((e) => {
                const bb = e.getComponentByClass(BoundingBox) as BoundingBox;
                const result = vec3.create();
                intersection(result, rayStart, ray, bb);
                if (result[0] !== 0 && result[1] !== 0 && result[1] !== 0) {
                    console.log('hit', result);
                }
            });
        }
    });
    
    world.addSystem(createTrackballCameraControlSystem({ world, canvas }));
    // world.addSystem(createRotationSystem({ world }));
    world.addSystem(createMouseRayPickingSystem({ world, mouseInput, canvas }));
    world.addSystem(createRenderSystem({ canvas, world }));

    world.addEntity(new Entity('Camera', [
        new PerspectiveCamera({ translation: [0, 3, 8], lookAt: [0, 0, 0], aspect: canvas.width / canvas.height }),
    ]));

    const data: Array<{translation: vec3, color: vec3}> = [
        { translation: [-1.5, 0, 1.5], color: [1, 0, 0] },
        { translation: [1.5, 0, 1.5], color: [0, 1, 0] },
        { translation: [-1.5, 0, -1.5], color: [0, 0, 1] },
        { translation: [1.5, 0, -1.5], color: [1, 0, 1] },
    ];

    data.forEach(({ translation, color }, idx) => {
        const geometry = new Geometry(plane);
        const transform = new Transform({ translation });
        const boundingbox = BoundingBox.fromGeometry(geometry);

        // if (boundingbox.data.min[1] === boundingbox.data.max[1]) {
        //     console.log('stretchedy');
        // }

        // stretch boundingbox a little on y axis for nicer rendering
        // boundingbox.data.initialMin[1] -= 0.0001;
        // boundingbox.data.min[1] -= 0.0001;

        // boundingbox.data.initialMax[1] += 0.0001;
        // boundingbox.data.max[1] += 0.0001;
        
        const material = new Material({ diffuseColor: color });
        world.addEntity(new Entity(`Plane-${idx}`, [geometry, transform, boundingbox, material]));
    });
    
    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };
    
    window.requestAnimationFrame(tick);
})();
