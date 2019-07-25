import api from '@/js/service/api';
import Vue from 'vue';
export default {
    name: 'HiveSidebar',
    events: ['showHive', 'getAllDbsAndTables', 'HiveSidebar:getDatabase', 'HiveSidebar:getTables', 'HiveSidebar:getTablePartitions'],
    dispatchs: ['Workbench:add', 'Workbench:run', 'Workbench:pasteInEditor',
        'HiveSidebar:getTables',
        'WorkSidebar:showTree', 'HdfsSidebar:showTree'],
    data: {
        API_PATH: process.env.VUE_APP_MN_CONFIG_PREFIX,
    },
    methods: {
        getAllDbsAndTables(args, cb) {
            api.fetch(`/datasource/all`, 'get').then((rst) => {
                const hiveList = [];
                if (rst.dbs) {
                    rst.dbs.forEach((list) => {
                        if (list.tables.length) {
                            list.tables.forEach((table) => {
                                hiveList.push({
                                    meta: 'tbname',
                                    value: table.tableName,
                                    caption: list.databaseName + '.' + table.tableName,
                                    documentation: `the name of a table, which belong to the db: ${list.databaseName}.`,
                                });
                            });
                        }
                        hiveList.push({
                            meta: 'dbname',
                            value: list.databaseName,
                            caption: list.databaseName,
                            documentation: 'the name of a database.',
                        });
                    });
                }
                cb({
                    list: hiveList,
                    isError: false,
                });
            }).catch((err) => {
                cb({
                    list: [],
                    isError: true,
                });
            });
        },
        showHive(arg, cb) {
            const Hive = Vue.extend(require('./hiveSidebar.vue'));
            const newW = new Hive();
            cb(newW);
        },
    },
    component: () => import('./hiveSidebar.vue'),
};
