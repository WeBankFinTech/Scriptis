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
            const WorkSpace = Vue.extend(require('./workSidebar.vue'));
            const newW = new WorkSpace();
            cb(newW);
        },
    },
    component: () =>
        import('./workSidebar.vue'),
};
