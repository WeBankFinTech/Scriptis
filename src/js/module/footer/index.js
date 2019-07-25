export default {
    name: 'Footer',
    events: ['Footer:updateRunningJob', 'Footer:getRunningJob'],
    component: () => import('./index.vue'),
};
