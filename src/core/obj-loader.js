const ObjLoader = {
    load: async (objFilePath) => fetch(objFilePath).then(response => response.text()),
};

export default ObjLoader;
