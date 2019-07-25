// vue.config.js
let CopyWebpackPlugin = require('copy-webpack-plugin')
let path = require('path')
module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve(__dirname, './src'),
                '@js': path.resolve(__dirname, './src/js'),
                '@assets': path.resolve(__dirname, './src/assets')
            }
        },
        plugins: [
            // 忽略moment的locale文件夹，然后再main.js中手动加载 ‘moment/locale/zh-cn'
            // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
            new CopyWebpackPlugin([{
                from: 'node_modules/monaco-editor/dev/vs',
                to: 'static/vs',
            }]),
        ]
    },
    // 选项...
    pluginOptions: {
        mock: {
            entry: 'mock.js',
            power: false
        }
    }
}
