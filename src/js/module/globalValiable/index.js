import api from '@/js/service/api';
export default {
    name: 'GlobalValiable',
    events: ['getGlobalVariable'],
    dispatchs: {
        IndexedDB: ['updateGlobalCache'],
    },
    methods: {
        getGlobalVariable(cb) {
            api.fetch('/variable/listGlobalVariable', 'get').then((res) => {
                cb({
                    list: res.globalVariables,
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
    component: () => import('./index.vue'),
};
