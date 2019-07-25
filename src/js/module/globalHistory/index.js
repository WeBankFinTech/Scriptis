export default {
    name: 'GlobalHistory',
    dispatchs: {
        Workbench: ['add'],
    },
    component: () => import('./index.vue'),
};
