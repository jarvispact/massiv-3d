export const FileLoader = {
    load: async (objFilePath: string): Promise<string> => fetch(objFilePath).then(response => response.text()),
};
