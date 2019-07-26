import Vue from 'vue';
export default {
    name: 'WorkSidebar',
    events: ['showTree', 'WorkSidebar:setHighLight', 'WorkSidebar:revealInSideBar'],
    dispatchs: {
        Workbench: ['add', 'run', 'openFile', 'remove', 'updateTab', 'checkExist'],
        HdfsSidebar: ['showTree'],
        HiveSidebar: ['showHive', 'getDatabase', 'getTables', 'getTablePartitions'],
        IndexedDB: ['getTabs'],
    },
    data: {
        API_PATH: process.env.VUE_APP_MN_CONFIG_PREFIX,
    },
    methods: {
        showTree(arg, cb) {
            // get tree
            const ws = require('./workSidebar.vue');
            const WSComp = Vue.extend(ws.default);
            const newW = new WSComp();
            cb(newW);
        },
    },
    component: () =>
        import('./workSidebar.vue'),
};
