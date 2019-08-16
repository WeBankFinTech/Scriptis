import VueRouter from 'vue-router';
import Layout from '../view/layout.vue';
const router = new VueRouter({
    routes: [
        {
            path: '',
            name: 'layout',
            redirect: '/home',
            component: Layout,
            meta: {
                title: 'Scriptis',
                publicPage: true, // 权限公开
            },
            children: [
                {
                    path: 'home',
                    name: 'Home',
                    meta: {
                        title: 'Scriptis',
                        keepAlive: true, // 需要被缓存
                        publicPage: true, // 权限公开
                    },
                    component: () => import('../view/home/index.vue'),
                },
                {
                    path: 'console',
                    name: 'Console',
                    meta: {
                        title: '管理台',
                        publicPage: true,
                    },
                    component: () => import('../view/console/index.vue'),
                    children: [{
                        name: 'dateReport',
                        path: 'dateReport',
                        component: () => import('../module/dateReport/index.vue'),
                        meta: {
                            title: '运营日报',
                            publicPage: true,
                        },
                    }, {
                        name: 'globalHistory',
                        path: 'globalHistory',
                        component: () => import('../module/globalHistory/index.vue'),
                        meta: {
                            title: '全局历史',
                            publicPage: true,
                        },
                    }, {
                        name: 'resource',
                        path: 'resource',
                        component: () => import('../module/resource/resource.vue'),
                        meta: {
                            title: '资源管理器',
                            publicPage: true,
                        },
                    }, {
                        name: 'setting',
                        path: 'setting',
                        component: () => import('../module/setting/setting.vue'),
                        meta: {
                            title: '设置',
                            publicPage: true,
                        },
                    }, {
                        name: 'globalValiable',
                        path: 'globalValiable',
                        component: () => import('../module/globalValiable/index.vue'),
                        meta: {
                            title: '全局变量',
                            publicPage: true,
                        },
                    }, {
                        name: 'FAQ',
                        path: 'FAQ',
                        component: () => import('../module/FAQ/index.vue'),
                        meta: {
                            title: '常见问题',
                            publicPage: true,
                        },
                    }],
                },
            ],
        },
        {
            path: '/login',
            name: 'login',
            meta: {
                title: 'Login',
                publicPage: true,
            },
            component: () => import('../view/login/index.vue'),
        },
        // 公用页面，不受权限控制
        {
            path: '/500',
            name: 'serverErrorPage',
            meta: {
                title: '服务器错误',
                publicPage: true,
            },
            component: () => import('../view/500.vue'),
        },
        {
            path: '/404',
            name: 'pageNotFound',
            meta: {
                title: '404',
                publicPage: true,
            },
            component: () => import('../view/404.vue'),
        },
        {
            path: '/403',
            name: 'pageForbidden',
            meta: {
                title: '403',
                publicPage: true,
            },
            component: () => import('../view/403.vue'),
        },
        {
            path: '*',
            meta: {
                title: 'Scriptis',
                publicPage: true,
            },
            component: () => import('../view/404.vue'),
        },

    ],
});
router.beforeEach((to, from, next) => {
    if (to.meta) {
        if (to.meta.publicPage) {
            // 公共页面不需要权限控制（404，500）
            next();
        } else {
            console.log('没有权限');
            next('/');
        }
    }
});
router.afterEach((to, from) => {
    console.log('访问：', to.fullPath);
    if (to.meta) {
        document.title = to.meta.title || 'Scriptis';
    }
});

export default router
;
