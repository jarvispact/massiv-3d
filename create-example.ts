import fs from 'fs';

const folderName = process.argv[2];
if (!folderName) {
    console.error('you need to specify a foldername for your new example');
    process.exit(1);
}

(async (): Promise<void> => {
    try {
        await fs.promises.mkdir(`examples/${folderName}`);
    } catch (error) {
        console.log(`will not create folder "examples/${folderName}" because it exists already`);
    }

    await fs.promises.copyFile('examples/00-hello-world/index.html', `examples/${folderName}/index.html`);

    try {
        await fs.promises.writeFile(`examples/${folderName}/index.js`, 'console.log(\'hi there\');\n', { flag: 'wx' });
    } catch (error) {
        console.log(`will not write file "examples/${folderName}/index.js" because it already exists`);
    }

    const fileContent = await fs.promises.readFile('examples/00-hello-world/index.html', 'utf-8');
    await fs.promises.writeFile(`examples/${folderName}/index.html`, fileContent.replace('<title>00-hello-world</title>', `<title>${folderName}</title>`));

    const fileContent2 = await fs.promises.readFile('examples/index.html', 'utf-8');
    await fs.promises.writeFile('examples/index.html', fileContent2.replace('<a style="display: none;">placeholder</a><br>', `<a href="${folderName}">${folderName}</a><br>\n\t\t<a style="display: none;">placeholder</a><br>`));
})();