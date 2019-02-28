const ImageLoader = {
    load: (url) => {
        const image = new Image();
        return new Promise((resolve) => {
            image.onload = () => resolve(image);
            image.src = url;
        });
    },
};

export default ImageLoader;
