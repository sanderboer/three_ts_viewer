const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    externals: ['three', 'html2canvas', 'libtess', 'proj4'],
    output: {
        path: path.resolve(__dirname, 'build/dist'),
        clean: true
    }
})
