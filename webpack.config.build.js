const webpackCommonConfig = require('./webpack-common-config');

module.exports = webpackCommonConfig({ outputFolder: 'dist', minified: false });
