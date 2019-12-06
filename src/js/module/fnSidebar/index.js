import api from '@/js/service/api';
export default {
    name: 'fnSidebar',
    events: ['getAllLoadedFunction'],
    dispatchs: ['WorkSidebar:showTree', 'Workbench:pasteInEditor', 'IndexedDB:updateGlobalCache', 'Workbench:getWorksLangList'],
    data: {},
    methods: {
        getAllLoadedFunction(cb) {
            api.fetch(`/udf/all`).then((rst) => {
                cb({
                    list: rst.udfTree.udfInfos,
                    isError: false,
                });
            }).catch((err) => {
                cb({
                    list: [],
                    isError: true,
                });
            });
        },
    },
    component: () => import('./fnSidebar.vue'),
};
