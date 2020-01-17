const createFPSDebugger = () => {
    const fpsDisplay = document.createElement('p');
    fpsDisplay.style.position = 'fixed';
    fpsDisplay.style.top = '10px';
    fpsDisplay.style.left = '10px';
    fpsDisplay.style.color = '#FFFFFF';
    fpsDisplay.style.zIndex = '10';
    document.body.appendChild(fpsDisplay);

    let oneSecond = Date.now() + 1000;
    let fps = 0;

    return {
        update: () => {
            fps++;
            const currentTime = Date.now();
            if (currentTime >= oneSecond) {
                fpsDisplay.textContent = `FPS: ${fps}`;
                fps = 0;
                oneSecond = currentTime + 1000;
            }
        },
    };
};