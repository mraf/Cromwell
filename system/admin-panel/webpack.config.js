const path = require('path');
const localProjectDir = __dirname;
const webpack = require('webpack');

const buildMode = process.env.NODE_ENV || 'production';
const isProduction = buildMode === 'production';

module.exports = {
    mode: buildMode,
    target: "web",
    devtool: isProduction ? false : "source-map",
    entry: {
        webapp: ['webpack-hot-middleware/client', path.resolve(localProjectDir, 'src/index.ts')]
    },
    output: {
        path: path.resolve(localProjectDir, 'build'),
        filename: 'webapp.js',
        publicPath: '/admin/build/',
        chunkFilename: 'chunks' + '/[id].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', 'jsx']
    },
    watchOptions: {
        ignored: ['build/**', '.cromwell/**', 'node_modules/**']
    },
    externals: [
        function ({ request }, callback) {
            if (request.startsWith('next')) {
                return callback(null, `root CromwellStore.nodeModules.modules['${request.replace(/\W/g, '_')}']`);
            }
            callback();
        },
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader', options: {
                            sourceMap: true
                        }
                    }
                ],
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    },
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader', options: {
                            sourceMap: true,
                            modules: {
                                localIdentName: '[local]_[hash:base64:5]'
                            },
                        }
                    },
                    {
                        loader: 'sass-loader', options: { sourceMap: true }
                    }
                ],
            },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ]
}
