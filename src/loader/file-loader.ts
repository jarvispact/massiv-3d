export const FileLoader = {
    load: async (filePath: string): Promise<string> => fetch(filePath).then(response => response.text()),
};