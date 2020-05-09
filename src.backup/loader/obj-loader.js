import ObjParser from './obj-parser';

const ObjLoader = {
    load: async (objFilePath) => fetch(objFilePath).then(response => response.text()).then(ObjParser.parse),
};

export default ObjLoader;
