const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = options => {
    const { WEBPACK_SERVE } = options

    return {
        mode: WEBPACK_SERVE ? 'development' : 'production',
        entry: path.resolve(__dirname, './src/index.tsx'),
        output: {
            path: path.resolve(__dirname, 'docs')
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    use: 'esbuild-loader',
                },
                {
                    test: /\.s?[ca]ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(svg|png|jpg|jpeg)$/i,
                    use: 'file-loader',
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            alias: {
                '~': path.resolve(__dirname, 'src')
            }
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, './src/template.html'),
                filename: 'index.html',
                hash: true,
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'statics'), // 源目录
                    }
                ],
            })
        ],
        devServer: {
            port: 3031,
            hot: true,
            static: path.resolve(__dirname, './statics')
        }
    }
}