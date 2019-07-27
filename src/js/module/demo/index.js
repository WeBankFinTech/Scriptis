// import index from './index.vue';
export default {
    // 模块名称
    name: 'Demo',
    // 规范模块监测什么事件，或者说模块对外提供什么接口
    events: ['Demo:add'], // Demo:add
    // 规范模块能够触发其他模块什么事件或者说调用其他模块什么接口
    dispatchs: ['OtherModule:add', 'OtherModule:delete'],
    // 规范模块的动作，由外部调用或者自己执行
    methods: {
        showTree(arg, cb) {
            console.log(arg);
        },
    },
    data() {
        return {};
    },
    // 路由
    route: {
        path: '/Demo',
        name: 'Demo',
        meta: {
            title: 'Scriptis | Demo',
            publicPage: false,
        },
        component: () => import('./index.vue'),
    },
    components: {
        index: () => import('./index.vue'),
    },
};
