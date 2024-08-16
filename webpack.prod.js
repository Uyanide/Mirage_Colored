const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlinlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new HtmlinlineScriptPlugin(),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new HtmlinlineScriptPlugin(),
    ],
});