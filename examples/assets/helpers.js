const DemoCube = {
    // 72
    // 24 vec3
    vertices: [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ],
    // 72
    // 24 vec3
    normals: [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ],
    // 48
    // 24 vec2
    uvs: [
        // Front
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Back
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Top
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Bottom
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Right
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Left
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ],
    // 36
    indices: [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ],
};

const createUpdateLoop = (domNode, update) => {
    let then = 0;
    let oneSecond = Date.now() + 1000;
    let fps = 0;

    const fpsDisplay = document.createElement('p');
    fpsDisplay.style.position = 'fixed';
    fpsDisplay.style.top = '10px';
    fpsDisplay.style.left = '10px';
    fpsDisplay.style.color = '#FFFFFF';
    fpsDisplay.style.zIndex = '10';
    document.body.appendChild(fpsDisplay);

    const tick = (now) => {
        now *= 0.001;
        const delta = now - then;
        then = now;
        fps++;

        const currentTime = Date.now();
        if (currentTime >= oneSecond) {
            const w = domNode.clientWidth;
            const h = domNode.clientHeight;
            fpsDisplay.textContent = `FPS: ${fps} | Screen: ${w}/${h}`;
            fps = 0;
            oneSecond = currentTime + 1000;
        }

        update(delta);
        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
};

const createDefaultLightAndCamera = (domNode, world) => {
    const light = world.createEntity([
        new MASSIV.DirectionalLight(new MASSIV.Vec3(5, 5, 5)),
    ]);

    const cameraPosition = new MASSIV.Vec3(0, 3, 10);
    const camera = world.createEntity([
        new MASSIV.Transform3D(cameraPosition),
        new MASSIV.PerspectiveCamera(45, domNode.clientWidth / domNode.clientHeight, 0.1, 1000).lookAt(cameraPosition, new MASSIV.Vec3(0, 0, 0)),
    ]);

    return {light, camera};
};