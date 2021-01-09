import { mat4, vec3, vec4 } from 'gl-matrix';
import { degreesToRadians, Entity, MouseInput, Nullable, System, World } from '../../../src';
import { BoundingBox } from '../components/bounding-box';
import { Material } from '../components/material';
import { PerspectiveCamera } from '../components/perspective-camera';
import { Transform } from '../components/transform';

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

type RotationSystemArgs = {
    world: World;
    mouseInput: MouseInput;
    canvas: HTMLCanvasElement,
};

type Ray = {
  origin: vec3;
  direction: vec3;
};

// mouseX and mouseY needs to be mapped to webgl normalized coordinates (-1 to 1)
const createRaycaster = (out: Ray) => {
  const vec4Clip = vec4.create();
  const vec4Eye = vec4.create();
  const matInvProj = mat4.create();
  const vec4World = vec4.create();
  const cameraWorld = mat4.create();

  return (mouseX: number, mouseY: number, camera: PerspectiveCamera) => {
      vec4.set(vec4Clip, mouseX, mouseY, -1, 1);

      mat4.invert(matInvProj, camera.data.projectionMatrix);
      vec4.transformMat4(vec4Eye, vec4Clip, matInvProj);
      vec4Eye[2] = -1; vec4Eye[3] = 0.0;
  
      mat4.invert(cameraWorld, camera.data.viewMatrix);
      vec4.transformMat4(vec4World, vec4Eye, cameraWorld);
  
      vec3.set(out.direction, vec4World[0], vec4World[1], vec4World[2]);
      vec3.normalize(out.direction, out.direction);
  
      vec3.set(out.origin, cameraWorld[12], cameraWorld[13], cameraWorld[14]);
  };
};

export const getNormalizedMouseX = (mouseInput: MouseInput, canvas: HTMLCanvasElement) => mouseInput.getMouseX() / canvas.width * 2 - 1;

export const getNormalizedMouseY = (mouseInput: MouseInput, canvas: HTMLCanvasElement) => 1 - mouseInput.getMouseY() / canvas.height * 2;

export const createMouseRayPickingSystem = ({ world, mouseInput, canvas }: RotationSystemArgs): System => {

    const ray: Ray = {
        origin: vec3.create(),
        direction: vec3.create(),
    };

    const castRay = createRaycaster(ray);

    return () => {
        const x = getNormalizedMouseX(mouseInput, canvas);
        const y = getNormalizedMouseY(mouseInput, canvas);
        const camera = (world.getEntity('Camera') as Entity).getComponentByClass(PerspectiveCamera);
        castRay(x, y, camera);

        const entities = world.queryEntities(['BoundingBox', 'Material']);
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const boundingbox = entity.getComponentByClass(BoundingBox);
            const result = vec3.create();

            intersection(result, ray.origin, ray.direction, boundingbox);
            if (result[0] !== 0 && result[1] !== 0 && result[1] !== 0) {
                console.log('hit', entity.name);
            }
        }
    };
};