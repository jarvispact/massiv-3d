export const ImageLoader = {
    load: async (imageSrcUrl: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`error loading image from url: "${imageSrcUrl}"`));
        img.src = imageSrcUrl;
    }),
};