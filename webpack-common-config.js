const path = require('path');

module.exports = ({ outputFolder, minified }) => ({
    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, outputFolder),
        filename: minified ? 'massiv-3d.min.js' : 'massiv-3d.js',
        libraryTarget: 'umd',
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
        ],
    },
});
