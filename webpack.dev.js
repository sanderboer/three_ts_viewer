const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, './public/'),
        },
    //    hot: true,
    },
    output: {
       path: path.join(__dirname, 'public/lib'),
        publicPath: "http://localhost:8080/lib/",
        clean: true
    },
    optimization: {
    //    runtimeChunk: 'single',
    },

})
