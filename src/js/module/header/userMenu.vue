<template>
  <ul
    class="user-menu">
    <li class="user-menu-arrow"/>
    <li
      class="user-menu-item"
      v-for="(menu) in menuList"
      :key="menu.id"
      @click="handleClick(menu.id)">
      <Icon
        class="user-menu-item-icon"
        :type="menu.icon">
      </Icon>
      <span>{{ menu.name }}</span>
    </li>
  </ul>
</template>
<script>
import module from './index';
import api from '@/js/service/api';
export default {
    name: 'Menu',
    mixins: [module.mixin],
    data() {
        return {
            menuList: [
                // {
                //     id: 'user-management',
                //     name: '用户管理',
                //     icon: 'ios-person-outline',
                // },
                {
                    id: 'FAQ',
                    name: '常见问题',
                    icon: 'ios-help-circle-outline',
                }, {
                    id: 'clearCache',
                    name: '清理缓存',
                    icon: 'ios-trash-outline',
                }, {
                    id: 'logout',
                    name: '退出登录',
                    icon: 'ios-log-out',
                }],
        };
    },
    methods: {
        handleClick(type) {
            switch (type) {
                case 'user-management':
                    this.openUserManagement();
                    break;
                case 'FAQ':
                    this.openFAQ();
                    break;
                case 'clearCache':
                    this.clearCache();
                    break;
                case 'logout':
                    this.getRunningJob();
                    break;
            }
        },
        openUserManagement() {
            this.$Message.info('功能开发中，敬请期待！');
        },
        openFAQ() {
            const newTab = window.open('about:blank');
            setTimeout(() => {
                newTab.location.href = this.getFAQUrl();
            }, 500);
        },
        clearCache() {
            this.$Modal.confirm({
                title: '警告',
                content: '<p>此操作将清空本地数据库缓存，这样会丢失您的脚本日志、历史和结果集等相关信息，请确认是否有未保存的脚本！</p><p>点击确认按钮继续操作？</p>',
                onOk: () => {
                    this.dispatch('IndexedDB:deleteDb');
                    this.$Message.success('清除本地数据缓存成功!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                },
                onCancel: () => {
                },
            });
        },
        getRunningJob() {
            this.dispatch('Footer:getRunningJob', (num) => {
                if (!num) return this.logout();
                this.$Modal.confirm({
                    title: '警告',
                    content: `<p>您有${num}个任务正在执行</p><p>是否要继续登出？</p>`,
                    onOk: () => {
                        this.logout();
                    },
                    onCancel: () => {
                    },
                });
            });
        },
        logout() {
            api.fetch('/user/logout', 'get').then(() => {
                this.$emit('clear-session');
                this.$router.push({ path: '/login' });
            });
        },
    },
};
</script>
