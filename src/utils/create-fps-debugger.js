const createFPSDebugger = (options = {}) => {
    const fpsDisplay = document.createElement('p');
    fpsDisplay.style.position = options.position || 'fixed';
    fpsDisplay.style.top = options.top || '10px';
    fpsDisplay.style.left = options.left || '10px';
    fpsDisplay.style.color = options.color || '#FFFFFF';
    fpsDisplay.style.zIndex = options.zIndex || '10';
    (options.parentElement || document.body).appendChild(fpsDisplay);

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

export default createFPSDebugger;
