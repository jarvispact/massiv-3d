const ImageLoader = {
    load: async (imageSrcUrl) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`error loading image from url: "${imageSrcUrl}"`));
        img.src = imageSrcUrl;
    }),
};

export default ImageLoader;
