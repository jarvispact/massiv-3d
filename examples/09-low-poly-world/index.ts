import { createObjFileParser, Entity, FileLoader, ImageLoader, parseMtlFile, World, ParsedMtlMaterial } from '../../src';
import { DirectionalLight } from './components/directional-light';
import { Geometry } from './components/geometry';
import { PhongMaterial } from './components/phong-material';
import { PerspectiveCamera } from './components/perspective-camera';
import { Rotation } from './components/rotation';
import { Transform } from './components/transform';
import { createRenderSystem } from './systems/render-system';
import { createRotationSystem } from './systems/rotation-system';

type Primitive = { positions: Array<number>, indices: Array<number>, normals: Array<number>, uvs: Array<number> };

const mergePrimitives = (primitives: Array<Primitive>): Primitive => {
    const mergedPrimitive: Primitive = { positions: [], indices: [], normals: [], uvs: [] };
    let idxCounter = 0;

    primitives.forEach((primitive) => {
        mergedPrimitive.positions.push(...primitive.positions);
        mergedPrimitive.indices.push(...primitive.indices.map((idx) => idxCounter + idx));
        mergedPrimitive.normals.push(...primitive.normals);
        mergedPrimitive.uvs.push(...primitive.uvs);
        idxCounter = idxCounter + primitive.indices[primitive.indices.length - 1] + 1;
    });

    return mergedPrimitive;
};

(async () => {
    const parseObjFile = createObjFileParser({ splitPrimitiveMode: 'group', flipUvY: true });

    const materials = await Promise.all([
        FileLoader.load('./assets/ground/ground_grass.mtl').then(parseMtlFile),
        FileLoader.load('./assets/cliff_half/cliff_blockHalf_rock.mtl').then(parseMtlFile),
        FileLoader.load('./assets/cliff/cliff_block_rock.mtl').then(parseMtlFile),
    ]);

    const textureMaps = await Promise.all([
        ImageLoader.load('./assets/character/skin_adventurer.png'),
        ImageLoader.load('./assets/character/skin_man.png'),
        ImageLoader.load('./assets/character/skin_manAlternative.png'),
        ImageLoader.load('./assets/character/skin_orc.png'),
        ImageLoader.load('./assets/character/skin_robot.png'),
        ImageLoader.load('./assets/character/skin_soldier.png'),
        ImageLoader.load('./assets/character/skin_woman.png'),
        ImageLoader.load('./assets/character/skin_womanAlternative.png'),
    ]);

    const tiles = await Promise.all([
        FileLoader.load('./assets/ground/ground_grass.obj').then(fileContent => parseObjFile(fileContent, materials[0])),
        FileLoader.load('./assets/cliff_half/cliff_blockHalf_rock.obj').then(fileContent => parseObjFile(fileContent, materials[1])),
        FileLoader.load('./assets/cliff/cliff_block_rock.obj').then(fileContent => parseObjFile(fileContent, materials[2])),
    ]);

    const characterModelParts = await FileLoader.load('./assets/character/basic_character.obj').then(parseObjFile);

    const grassTileMaterial = materials[0].find((_, idx) => idx === tiles[0][0].materialIndex) as ParsedMtlMaterial;
    const cliffHalfMaterial = materials[1].find((_, idx) => idx === tiles[1][0].materialIndex) as ParsedMtlMaterial;
    const cliffMaterial = materials[2].find((_, idx) => idx === tiles[2][0].materialIndex) as ParsedMtlMaterial;
    const materialos = [grassTileMaterial, cliffHalfMaterial, cliffMaterial];
    
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const world = new World();
    
    world.addSystem(createRotationSystem({ world }));
    world.addSystem(createRenderSystem({ canvas, world }));

    world.addEntity(new Entity('Camera', [
        new PerspectiveCamera({ translation: [0, 3, 5], lookAt: [0, 0, 0], aspect: canvas.width / canvas.height }),
    ]));

    world.addEntity(new Entity('Light', [
        new DirectionalLight({ direction: [0, 3, 5] }),
    ]));

    const tileMap = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 2, 0],
    ];

    console.log(tiles);

    tileMap.forEach((tileColumn, columnIdx) => {
        tileColumn.forEach((tileRow, rowIdx) => {
            world.addEntity(new Entity(`tile-${columnIdx}-${rowIdx}`, [
                new Transform({ translation: [rowIdx, 0, columnIdx] }),
                new Geometry(tiles[tileRow][tileRow === 0 ? 0 : 1]),
                new PhongMaterial(materialos[tileRow]),
            ]));
        });
    });
    
    // world.addEntity(new Entity('GroundGrassTile', [
    //     new Transform(),
    //     new Geometry(groundGrassTile),
    //     new PhongMaterial(grassTileMaterial),
    // ]));

    world.addEntity(new Entity('Character', [
        new Transform({ scaling: [0.1, 0.1, 0.1] }),
        new Rotation([0, 45, 0]),
        new Geometry(mergePrimitives(characterModelParts)),
        new PhongMaterial({ diffuseMap: textureMaps[0] }),
    ]));
    
    const tick = (time: number) => {
        world.update(time);
        window.requestAnimationFrame(tick);
    };
    
    window.requestAnimationFrame(tick);
})();
