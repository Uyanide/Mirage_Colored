const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/scripts/init.js',
    output: {
        // filename: 'main.js',
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, './docs'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-syntax-dynamic-import'],
                    },
                },
            },
            // {
            //     test: /\.(png|jpe?g|gif)$/i,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             options: {
            //                 name: '[path][name].[ext]',
            //             },
            //         },
            //     ],
            // },
            {
                test: /\.ico$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            // {
            //     test: /\.worker\.js$/,
            //     use: {
            //         loader: 'worker-loader',
            //         options: {
            //             filename: '[name].[contenthash].worker.js',
            //         },
            //     },
            // },
            // {
            //     test: /\.wasm$/,
            //     type: 'webassembly/async',
            // },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'head',
            scriptLoading: 'defer',
        }),
    ],
};