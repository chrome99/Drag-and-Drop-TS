const path = require('path');
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: './src/app.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public'),
    },
    devServer: {
        static: [
          {
            directory: path.join(__dirname),
          },
        ],
      },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: '/node_modules'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CleanPlugin.CleanWebpackPlugin()
    ]
}