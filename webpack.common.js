const path = require('path')

// common config:
module.exports = {
    target : 'web',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    output: {
        library: 'Three3dViewer',
        libraryTarget: 'umd',
        filename: 'Three3dViewer.min.js',
        sourceMapFilename: 'Three3dViewer.js.map',
    }

}
