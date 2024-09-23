const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = options => {
    const {} = options

    return {
        mode: 'development',
        entry: path.resolve(__dirname, './src/index.tsx'),
        output: {
            path: path.resolve(__dirname, 'dist')
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
            })
        ],
        devServer: {
            port: 3031,
            hot: true,
            static: path.resolve(__dirname, './static')
        }
    }
}