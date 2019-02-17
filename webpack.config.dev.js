const webpackCommonConfig = require('./webpack-common-config');

module.exports = webpackCommonConfig({ outputFolder: 'tests', minified: false });
