import { World } from '../../src';
import { Geometry } from './components/geometry';
import { createRenderSystem } from './systems/render-system';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const world = new World();

world.addSystem(createRenderSystem({ canvas, world }));

world.addEntity('DemoPlane', [
    new Geometry({
        positions: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
        indices: [0, 1, 2, 0, 2, 3],
        colors: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    }),
]);

const tick = (time: number) => {
    world.update(time);
    window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);

// type TransformData = {
//     translation: vec3;
//     scaling: vec3;
//     quaternion: quat;
//     modelMatrix: mat4;
//     dirty: true;
// }

// type Transform = Component<'Transform', TransformData>;

// const createComponent = (): Transform => ({
//     type: 'Transform' as const,
//     data: {
//         translation: vec3.fromValues(0, 0, 0),
//         scaling: vec3.fromValues(1, 1, 1),
//         quaternion: quat.fromValues(0, 0, 0, 1),
//         modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
//         dirty: true,
//     },
// });

// class Componento implements Transform {
//     type: 'Transform';
//     data: TransformData;
//     constructor() {
//         this.type = 'Transform';
//         this.data = {
//             translation: vec3.fromValues(0, 0, 0),
//             scaling: vec3.fromValues(1, 1, 1),
//             quaternion: quat.fromValues(0, 0, 0, 1),
//             modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
//             dirty: true,
//         };
//     }

//     setTranslation(x: number, y: number, z: number) {
//         this.data.translation[0] = x;
//         this.data.translation[1] = y;
//         this.data.translation[2] = z;
//         mat4.fromTranslation(this.data.modelMatrix, this.data.translation);
//         this.data.dirty = true;
//     }
// }

// // const getBufferLayoutFromData = (data: Record<string, vec3 | quat | mat4 | Float32Array>) => {
// //     const F32BPE = Float32Array.BYTES_PER_ELEMENT;
// //     type Layout = Record<string, { offset: number, size: number }>;

// //     const accumulator = {
// //         byteLength: 0,
// //         layout: {} as Layout,
// //     };

// //     let byteOffset = 0;

// //     const layout = Object.keys(data).reduce((accum, key) => {
// //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// //         // @ts-ignore
// //         accum[key] = { offset: byteOffset, size: data[key].length };
// //         byteOffset += data[key].length * F32BPE;
// //         return accum;
// //     }, accumulator);

// //     console.log({ layout });

// //     return layout;
// // };

// // const layout = getBufferLayoutFromData({
// //     translation: vec3.fromValues(0, 0, 0),
// //     scaling: vec3.fromValues(1, 1, 1),
// //     quaternion: quat.fromValues(0, 0, 0, 1),
// //     modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
// //     dirty: new Float32Array(1),
// // });

// const translationArraySize = 3;
// const scalingArraySize = 3;
// const quaternionArraySize = 4;
// const modelMatrixArraySize = 16;
// const dirtyArraySize = 1;

// const translationSize = translationArraySize * Float32Array.BYTES_PER_ELEMENT;
// const scalingSize = scalingArraySize * Float32Array.BYTES_PER_ELEMENT;
// const quaternionSize = quaternionArraySize * Float32Array.BYTES_PER_ELEMENT;
// const modelMatrixSize = modelMatrixArraySize * Float32Array.BYTES_PER_ELEMENT;
// const dirtySize = dirtyArraySize * Float32Array.BYTES_PER_ELEMENT;
// const totalSize = translationSize + scalingSize + quaternionSize + modelMatrixSize + dirtySize;

// const translationOffset = 0;
// const scalingOffset = translationSize;
// const quaternionOffset = translationSize + scalingSize;
// const modelMatrixOffset = translationSize + scalingSize + quaternionSize;
// const dirtyOffset = translationSize + scalingSize + quaternionSize + modelMatrixSize;

// const bufferLayout = {
//     translation: { offset: translationOffset, size: translationArraySize },
//     scaling: { offset: scalingOffset, size: scalingArraySize },
//     quaternion: { offset: quaternionOffset, size: quaternionArraySize },
//     modelMatrix: { offset: modelMatrixOffset, size: modelMatrixArraySize },
//     dirty: { offset: dirtyOffset, size: dirtyArraySize },
// };

// const createSharedArrayBufferComponent = () => {
//     const buffer = new SharedArrayBuffer(totalSize);
//     return {
//         type: 'Transform' as const,
//         buffer,
//         data: {
//             translation: new Float32Array(buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
//             scaling: new Float32Array(buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
//             quaternion: new Float32Array(buffer, bufferLayout.quaternion.offset, bufferLayout.quaternion.size),
//             modelMatrix: new Float32Array(buffer, bufferLayout.modelMatrix.offset, bufferLayout.modelMatrix.size),
//             dirty: new Float32Array(buffer, bufferLayout.dirty.offset, bufferLayout.dirty.size),
//         },
//     };
// };

// type SharedArrayBufferTransform = ReturnType<typeof createSharedArrayBufferComponent>;

// const createArrayBufferComponent = () => {
//     const buffer = new ArrayBuffer(totalSize);
//     return {
//         type: 'Transform' as const,
//         buffer,
//         data: {
//             translation: new Float32Array(buffer, bufferLayout.translation.offset, bufferLayout.translation.size),
//             scaling: new Float32Array(buffer, bufferLayout.scaling.offset, bufferLayout.scaling.size),
//             quaternion: new Float32Array(buffer, bufferLayout.quaternion.offset, bufferLayout.quaternion.size),
//             modelMatrix: new Float32Array(buffer, bufferLayout.modelMatrix.offset, bufferLayout.modelMatrix.size),
//             dirty: new Float32Array(buffer, bufferLayout.dirty.offset, bufferLayout.dirty.size),
//         },
//     };
// };

// type ArrayBufferTransform = ReturnType<typeof createArrayBufferComponent>;

// console.log('populate arrays with components');

// const list1: Array<Transform> = [];
// const list2: Array<Componento> = [];
// const list3: Array<SharedArrayBufferTransform> = [];
// const list4: Array<ArrayBufferTransform> = [];
// const size = 500000;

// for (let i = 0; i < size; i++) {
//     list1.push(createComponent());
//     list2.push(new Componento());
//     list3.push(createSharedArrayBufferComponent());
//     list4.push(createArrayBufferComponent());
// }

// const rand = (max: number) => Math.round(Math.random() * max);

// // createComponent

// const system1 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list1[i];
//         c.data.translation[0] = rand(100 * delta);
//         c.data.translation[1] = rand(100 * delta);
//         c.data.translation[2] = rand(100 * delta);
//         mat4.fromTranslation(c.data.modelMatrix, c.data.translation);
//         c.data.dirty = true;
//     }
// };

// const system2 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list1[rand(size - 1)];
//         c.data.translation[0] = rand(100 * delta);
//         c.data.translation[1] = rand(100 * delta);
//         c.data.translation[2] = rand(100 * delta);
//         mat4.fromTranslation(c.data.modelMatrix, c.data.translation);
//         c.data.dirty = true;
//     }
// };

// // Componento

// const system3 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list2[i];
//         c.setTranslation(rand(100 * delta), rand(100 * delta), rand(100 * delta));
//     }
// };

// const system4 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list2[rand(size - 1)];
//         c.setTranslation(rand(100 * delta), rand(100 * delta), rand(100 * delta));
//     }
// };

// // SharedArrayBufferComponent

// const system5 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list3[i];
//         c.data.translation[0] = rand(100 * delta);
//         c.data.translation[1] = rand(100 * delta);
//         c.data.translation[2] = rand(100 * delta);
//         mat4.fromTranslation(c.data.modelMatrix, c.data.translation);
//         c.data.dirty[0] = 1;
//     }
// };

// const system6 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list3[rand(size - 1)];
//         c.data.translation[0] = rand(100 * delta);
//         c.data.translation[1] = rand(100 * delta);
//         c.data.translation[2] = rand(100 * delta);
//         mat4.fromTranslation(c.data.modelMatrix, c.data.translation);
//         c.data.dirty[0] = 1;
//     }
// };

// // ArrayBufferComponent

// const system7 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list4[i];
//         c.data.translation[0] = rand(100 * delta);
//         c.data.translation[1] = rand(100 * delta);
//         c.data.translation[2] = rand(100 * delta);
//         mat4.fromTranslation(c.data.modelMatrix, c.data.translation);
//         c.data.dirty[0] = 1;
//     }
// };

// const system8 = (delta: number) => {
//     for (let i = 0; i < size; i++) {
//         const c = list4[rand(size - 1)];
//         c.data.translation[0] = rand(100 * delta);
//         c.data.translation[1] = rand(100 * delta);
//         c.data.translation[2] = rand(100 * delta);
//         mat4.fromTranslation(c.data.modelMatrix, c.data.translation);
//         c.data.dirty[0] = 1;
//     }
// };

// const delta = 0.16;

// const test1 = () => {
//     const before = Date.now();
//     system1(delta);
//     return Date.now() - before;
// };

// const test2 = () => {
//     const before = Date.now();
//     system2(delta);
//     return Date.now() - before;
// };

// const test3 = () => {
//     const before = Date.now();
//     system3(delta);
//     return Date.now() - before;
// };

// const test4 = () => {
//     const before = Date.now();
//     system4(delta);
//     return Date.now() - before;
// };

// const test5 = () => {
//     const before = Date.now();
//     system5(delta);
//     return Date.now() - before;
// };

// const test6 = () => {
//     const before = Date.now();
//     system6(delta);
//     return Date.now() - before;
// };

// const test7 = () => {
//     const before = Date.now();
//     system7(delta);
//     return Date.now() - before;
// };

// const test8 = () => {
//     const before = Date.now();
//     system8(delta);
//     return Date.now() - before;
// };

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// (async () => {
//     console.log('sleeping 10 seconds before start ...');
//     await sleep(10000);

//     const rumRuns = 20;
//     let times = 0;

//     console.log('[createComponent - linear] starting test1');
//     for (let i = 0; i < rumRuns; i++) times += test1();
//     console.log(`test1: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[createComponent - random] starting test2');
//     for (let i = 0; i < rumRuns; i++) times += test2();
//     console.log(`test2: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[Componento - linear] starting test3');
//     for (let i = 0; i < rumRuns; i++) times += test3();
//     console.log(`test3: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[Componento - random] starting test4');
//     for (let i = 0; i < rumRuns; i++) times += test4();
//     console.log(`test4: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[SharedArrayBufferComponent - linear] starting test5');
//     for (let i = 0; i < rumRuns; i++) times += test5();
//     console.log(`test5: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[SharedArrayBufferComponent - random] starting test6');
//     for (let i = 0; i < rumRuns; i++) times += test6();
//     console.log(`test6: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[ArrayBufferComponent - linear] starting test5');
//     for (let i = 0; i < rumRuns; i++) times += test7();
//     console.log(`test7: avg time: ${times / rumRuns} milliseconds`);

//     times = 0;

//     console.log('[ArrayBufferComponent - random] starting test6');
//     for (let i = 0; i < rumRuns; i++) times += test8();
//     console.log(`test8: avg time: ${times / rumRuns} milliseconds`);
// })();
