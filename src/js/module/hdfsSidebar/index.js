import Vue from 'vue';
export default {
    name: 'HdfsSidebar',
    events: ['showTree', 'HdfsSidebar:setHighLight'],
    dispatchs: {
        Workbench: ['add', 'openFile', 'run', 'remove', 'updateTab', 'checkExist'],
        WorkSidebar: ['showTree'],
        HiveSidebar: ['showHive', 'getDatabase', 'getTables', 'getTablePartitions'],
        IndexedDB: ['getTabs'],
    },
    data: {
        API_PATH: process.env.VUE_APP_MN_CONFIG_PREFIX,
    },
    methods: {
        showTree(arg, cb) {
            const WorkSpace = Vue.extend(require('./hdfsSidebar.vue'));
            const newW = new WorkSpace();
            cb(newW);
        },
    },
    component: () => import('./hdfsSidebar.vue'),
};
