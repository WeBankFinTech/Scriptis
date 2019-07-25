import moduleMixin from '../service/moduleMixin';
let modules = [];
const requireComponent = require.context(
    // 其组件目录的相对路径
    './',
    // 是否查询其子目录
    true,
    /([a-z|A-Z])+\/index\.js$/
);

requireComponent.keys().forEach((fileName) => {
    // 获取组件配置
    let moduleConfig = requireComponent(fileName);
    moduleConfig = moduleConfig.default || moduleConfig;
    moduleConfig.mixin = moduleMixin(moduleConfig);
    modules.push(moduleConfig);
});
