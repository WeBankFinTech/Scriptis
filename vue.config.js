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

const port = process.env.PORT || 8080


module.exports = {
    outputDir: 'dist/dist',
    chainWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            config.plugin('compress').use(FileManagerPlugin, [{
                onEnd: {
                    copy: [
                        { source: 'node_modules/monaco-editor/dev/vs', destination: `./dist/dist/static/vs` },
                        { source: './config.sh', destination: `./dist` },
                        { source: './install.sh', destination: `./dist` }
                    ],
                    // 先删除根目录下的zip包
                    delete: [`./wedatasphere-scriptis-${getVersion()}-dist.zip`],
                    // 将dist文件夹下的文件进行打包
                    archive: [
                        { source: './dist', destination: `./wedatasphere-scriptis-${getVersion()}-dist.zip` },
                    ]
                },
            }])
        }
    },
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
    },
    devServer: {
        port: port,
        open: true,
        overlay: {
            warnings: false,
            errors: true
        },
        proxy: {
            [process.env.VUE_APP_MN_CONFIG_PREFIX]: {
                target: process.env.SERVER_HOST,
                ws: true,
                changeOrigin: true,
            },
            [process.env.VUE_APP_MN_CONFIG_SOCKET]: {
                target: process.env.SERVER_HOST,
                ws: true,
                secure: false,
              },
        }
    }
}