export default {
    name: 'Explorer',
    events: [],
    component: {
        index: () => import('./index.vue'),
        resource: () => import('./resource.vue'),
    },
};
