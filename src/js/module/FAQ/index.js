export default {
    name: 'FAQ',
    data: {
        ENVIR: process.env.NODE_ENV,
    },
    component: () => import('./index.vue'),
};
