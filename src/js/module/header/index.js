export default {
    name: 'Header',
    component: () => import('./index.vue'),
    dispatchs: ['Footer:getRunningJob', 'IndexedDB:deleteDb'],
};
