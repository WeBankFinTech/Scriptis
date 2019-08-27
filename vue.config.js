// vue.config.js
let CopyWebpackPlugin = require('copy-webpack-plugin')
let FileManagerPlugin = require('filemanager-webpack-plugin');
let path = require('path')
let fs = require('fs');

const getVersion = () => {
    const pkgPath = path.join(__dirname, './package.json');
    let pkg = fs.readFileSync(pkgPath);
    pkg = JSON.parse(pkg);
    return pkg.version;
}

module.exports = {
    outputDir: 'dist/dist',
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
            }, {
                from: './config.sh',
                to: '../',
            }, {
                from: './install.sh',
                to: '../',
            }]),
            // 自动打包成zip包
            new FileManagerPlugin({
                onEnd: {
                    // 先删除根目录下的zip包
                    delete: [`./wedatasphere-scriptis-${getVersion()}-dist.zip`],
                    // 将dist文件夹下的文件进行打包
                    archive: [
                        { source: './dist', destination: `./wedatasphere-scriptis-${getVersion()}-dist.zip` }
                    ]
                },
            })
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
