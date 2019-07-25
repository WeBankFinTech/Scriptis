export default {
    name: 'resourceSimple',
    component: () => import('./index.vue'),
    dispatchs: ['Workbench:add', 'Footer:updateRunningJob'],
}
;
