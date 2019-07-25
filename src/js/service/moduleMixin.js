import eventbus from '../helper/eventbus';
import Fesx from '../helper/fesx';
import util from '../util';

let module = function(config) {
    if (!config.name) {
        return console.error('请配置独一无二的ModuleName');
    }
    // 控制对外抛出的事件
    let dispatchs = config.dispatchs || [];
    if (util.isPlainObject(dispatchs)) {
        let arr = [];
        for (let p in dispatchs) {
            if (util.isArray(dispatchs[p])) {
                dispatchs[p].forEach((item) => {
                    arr.push(`${p}:${item}`); 
                });
            }
        }
        dispatchs = arr;
    }
    // 全局状态
    let fesx = new Fesx(config.name, config.data);
    // 处理模块 methods
    if (config.methods) {
        let methods = Object.keys(config.methods);
        if (methods.length > 0) {
            methods.forEach((name) => {
                let method = config.methods[name];
                if (method) {
                    eventbus.on(`${config.name}:${name}`, method.bind(config));
                }
            });
        }
    }
    // 挂载dispatch到空模块
    /**
     * @param {*} name
     * @param {*} param
     * @param {*} [cb=new Function()]
     */
    config.dispatch = function(name, param, cb = new Function()) {
        if (util.isArray(dispatchs) && dispatchs.indexOf(name) != -1) {
            eventbus.emit(name, param, cb);
        }
    };
    
    return {
        data: function() {
            // 模块共同的fesx
            let data = {
                fesx: fesx,
            };
            return data;
        },
        created() {
            // 处理模块下的组件监听
            if (config.events) {
                let events = config.events;
                if (util.isArray(events) && events.length > 0) {
                    events.forEach((name) => {
                        let method = this[name];
                        if (method) {
                            eventbus.on(`${name}`, method);
                        }
                    });
                }
            }
        },
        beforeDestroy: function() {
            if (config.events) {
                let events = config.events;
                if (util.isArray(events) && events.length > 0) {
                    events.forEach((name) => {
                        let method = this[name];
                        if (method) {
                            eventbus.off(name, method);
                        }
                    });
                }
            }
        },
        methods: {
            // 触发事件
            dispatch: config.dispatch,
        },
    };
};
export default module;
