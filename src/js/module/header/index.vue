<template>
  <div class="layout-header">
    <div class="logo">
      WeDataSphere
    </div>
    <ul class="menu">
      <li
        v-for="(item, index) in sys"
        :key="index"
        :class="getClass(item.path)"
        class="menu-item"
        @click="goto(item.path)">
        <span>{{ item.name }}</span>
        <div
          v-if="item.name === '看板系统'"
          class="menu-item-beat">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            viewBox="0 0 1024 1024"
            width="22"
            height="22"
            p-id="1485"
            version="1.1"
            t="1553825762311">
            <g>
              <path
                d="M 511.108 501.223 c -24.586 1.37635 -37.9043 13.6693 -39.9529 36.88 l 78.8816 0 C 548.67 514.893 535.694 502.6 511.108 501.223 Z"
                p-id="1486"
                fill="#fff" />
              <path
                d="M 771.312 586.25 c -0.682545 10.9269 7.85388 16.3913 25.6103 16.3913 c 30.0504 -2.04866 46.4407 -16.3913 49.1729 -43.0259 l 0 -11.2686 c -8.87821 5.47469 -22.5373 10.2443 -40.9773 14.3416 C 782.582 566.787 771.312 574.641 771.312 586.25 Z"
                p-id="1487"
                fill="#fff" />
              <path
                d="M 327.734 505.321 c -22.5373 1.37635 -34.1477 14.6937 -34.8303 39.9529 l 0 14.3416 c 0.682545 25.2695 11.9512 38.5868 33.8059 39.9529 c 23.9034 0.682545 35.8546 -16.0383 35.8546 -50.1973 C 361.882 521.37 350.272 506.697 327.734 505.321 Z"
                p-id="1488"
                fill="#fff" />
              <path
                d="M 896.52 304.876 L 225.496 304.876 c -35.2703 0 -63.8645 28.5932 -63.8645 63.8656 l 0 227.135 l -84.0441 76.5177 l 0.213871 0.703011 c -7.28696 4.43603 -12.4107 12.0945 -12.4107 21.25 c 0 13.962 11.3178 25.2798 25.2798 25.2798 c 0.444115 0 0.814552 -0.230244 1.25355 -0.25378 l 0.075725 0.25378 l 133.496 0 l 103.558 0 l 567.466 0 c 35.2703 0 63.8645 -28.5932 63.8645 -63.8645 L 960.384 368.74 C 960.383 333.469 931.79 304.876 896.52 304.876 Z M 341.053 631.326 c -21.1712 0 -36.88 -8.19566 -47.1232 -24.586 l 0 20.4886 l -44.0503 0 L 249.879 401.853 l 44.0503 0 l 0 96.2962 c 10.2443 -17.7564 27.3182 -26.6356 51.2216 -26.6356 c 40.2937 2.04866 61.1241 27.66 62.4902 76.8319 C 407.64 603.666 385.444 631.326 341.053 631.326 Z M 513.156 631.326 c -54.6364 -2.04866 -82.9789 -27.66 -85.0275 -76.8319 c 2.04866 -53.2703 29.0251 -80.9302 80.9302 -82.9789 c 55.3189 0 82.9789 27.66 82.9789 82.9789 l 0 10.2443 L 472.179 564.738 c 1.36611 23.2209 15.0252 35.5138 40.9773 36.8789 c 18.44 0 30.3912 -6.81931 35.8546 -20.4886 l 46.0989 5.12165 C 582.818 616.3 555.5 631.326 513.156 631.326 Z M 679.114 631.326 c -31.4155 0.672312 -46.7825 -14.6937 -46.0989 -46.0989 l 0 -77.8562 l -25.6103 0 l 0 -32.7816 l 25.6103 0 l 0 -51.2216 l 42.0016 -9.21999 l 0 60.4416 l 36.88 0 l 0 32.7816 l -36.88 0 l 0 68.6372 c 0 15.719 6.48776 23.5616 19.4643 23.5616 c 4.78089 0 9.21999 -1.36611 13.3173 -4.09732 l 9.21999 27.66 C 708.823 628.593 696.188 631.326 679.114 631.326 Z M 852.242 627.227 c -4.09732 -6.147 -6.48776 -13.6591 -7.17133 -22.5373 c -14.3416 17.0626 -36.5382 25.9521 -66.5876 26.6356 c -30.733 -2.04866 -47.1243 -16.3913 -49.1729 -43.0259 c 0 -28.0007 19.1225 -44.392 57.3676 -49.1729 c 30.0504 -6.147 48.8311 -11.2686 56.3432 -15.366 c 1.36611 -15.7078 -9.21999 -23.2096 -31.7573 -22.5373 c -19.1225 0 -31.0747 7.17133 -35.8546 21.513 l -40.9773 -6.147 c 8.19566 -30.0504 33.4652 -45.0746 75.8075 -45.0746 c 52.5877 -1.36611 77.8562 20.1469 75.8075 64.5389 c 0 15.0252 0 35.1823 0 60.4416 c 0 12.293 2.73223 22.5373 8.19566 30.733 L 852.242 627.228 Z"
                p-id="1489"
                fill="#fff" />
            </g>
          </svg>
        </div>
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
                name: '意书',
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
            api.fetch('/publicservice/getBaseInfo', 'get').then((rst) => {
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
