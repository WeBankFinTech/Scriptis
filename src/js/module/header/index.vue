<template>
  <div class="layout-header">
    <div class="logo">
      <span class="logo-main-titile">Scriptis</span>
      <span class="logo-sub-title">
        <span>@Powered by </span>
        <span class="logo-sub-title-main">Linkis</span>
      </span>
    </div>
    <ul class="menu">
      <li
        v-for="(item, index) in sys"
        :key="index"
        :class="getClass(item.path)"
        class="menu-item"
        @click="goto(item.path)">
        <span>{{ item.name }}</span>

      </li>
    </ul>
    <div
      v-clickoutside="handleOutsideClick"
      :class="{'selected': isUserMenuShow}"
      class="user"
      @click="handleUserClick">
      <span>{{ userName }}</span>
      <Icon
        v-show="!isUserMenuShow"
        type="ios-arrow-down"
        class="user-icon"/>
      <Icon
        v-show="isUserMenuShow"
        type="ios-arrow-up"
        class="user-icon"/>
      <userMenu
        v-show="isUserMenuShow"
        @clear-session="clearSession"/>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import module from './index';
import userMenu from './userMenu.vue';
import clickoutside from '@js/helper/clickoutside';
export default {
    directives: {
        clickoutside,
    },
    components: {
        userMenu,
    },
    mixins: [module.mixin],
    data() {
        return {
            sys: [{
                name: '开发',
                path: 'Home',
            }, {
                name: '管理台',
                path: 'Console',
            }],
            isUserMenuShow: false,
            userName: '',
        };
    },
    created() {
        this.init();
    },
    mounted() {
    },
    methods: {
        init() {
            api.fetch('/application/getBaseInfo', 'get').then((rst) => {
                if (!_.isEmpty(rst)) {
                    this.userName = rst.userInfo.basic.userName;
                    storage.set('baseInfo', rst);
                    storage.set('userInfo', rst.userInfo);
                    this.$router.app.$emit('username', rst.userInfo.basic.userName);
                    this.$emit('set-init');
                }
            });
        },
        goto(name) {
            this.$router.push({
                name: name,
            });
        },
        getClass(path) {
            let arr = [];
            if (this.$route.matched && this.$route.matched.length > 0) {
                let first = this.$route.matched[this.$route.matched.length - 1];
                if (first.name == path) {
                    arr.push('selected');
                }
            }
            return arr;
        },
        handleOutsideClick() {
            this.isUserMenuShow = false;
        },
        handleUserClick() {
            this.isUserMenuShow = !this.isUserMenuShow;
        },
        clearSession() {
            this.$emit('clear-session');
        },
    },
};
</script>
<style lang="scss" src="./index.scss"></style>
