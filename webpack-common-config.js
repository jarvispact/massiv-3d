const path = require('path');

module.exports = ({ minified }) => ({
    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
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
