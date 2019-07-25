<template>
  <div class="we-file-navbar">
    <div
      v-show="showStatus.nav"
      class="we-file-navbar-nav">
      <Icon
        v-if="nav.isShowNav('search')"
        :size="16"
        type="ios-search-outline"
        title="搜索"
        class="navbar-cursor"
        @click="showSearch"/>
      <Icon
        v-if="nav.isShowNav('newFile')"
        :size="16"
        type="ios-add-circle-outline"
        :title="addTitle"
        class="navbar-cursor"
        @click="addFile"/>
      <Icon
        v-if="nav.isShowNav('refresh')"
        :size="20"
        type="ios-refresh"
        title="刷新"
        class="navbar-cursor"
        @click="refresh"/>
    </div>
    <we-searchbox
      v-show="showStatus.search"
      ref="searchbox"
      v-model="searchText"
      :placeholder="placeholder"
      @on-blur="handleBlur"/>
  </div>
</template>
<script>
import weSearchbox from './searchbox.vue';
import Nav from './nav.js';
export default {
    components: {
        weSearchbox,
    },
    props: {
        navList: {
            type: Array,
            require: true,
        },
        placeholder: {
            type: String,
            default: '请输入文件夹或文件名搜索',
        },
        addTitle: {
            type: String,
            default: '新建目录',
        },
    },
    data() {
        return {
            nav: null,
            searchText: '',
            showStatus: {
                search: false,
                nav: true,
            },
        };
    },
    watch: {
        searchText: function(value) {
            this.$emit('text-change', value);
        },
    },
    created() {
        this.nav = new Nav({
            navList: this.navList,
        });
    },
    methods: {
        showSearch() {
            this.showStatus.search = true;
            this.showStatus.nav = false;
            this.$nextTick(() => {
                this.$refs.searchbox.onfocus();
            });
        },
        handleBlur(value) {
            if (!value) {
                this.showStatus.search = false;
                this.showStatus.nav = true;
            }
        },
        refresh() {
            this.searchText = '';
            this.$emit('on-refresh');
        },
        addFile() {
            this.$emit('on-add');
        },
    },
};
</script>
<style lang="scss" src="./index.scss"></style>
