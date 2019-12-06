<template>
  <div
    class="setting"
    :style="{'height': height + 'px'}">
    <Menu
      active-name="全局"
      :open-names="['1', '2']"
      @on-select="getAppVariable"
      ref="settingMenu"
      class="setting-menu">
      <MenuItem name="全局"><Icon type="ios-paper" />通用设置</MenuItem>
      <Submenu
        :name="menu.name"
        v-for="(menu, index) in menuList"
        :key="index">
        <template slot="title">
          <Icon :type="menu.icon" />
          {{ menu.title }}
        </template>
        <MenuItem
          v-for="(item, index2) in menu.children"
          :name="item.name"
          :key="index2"
        >{{ item.title }}</MenuItem>
      </Submenu>
    </Menu>
    <div
      v-if="fullTree && fullTree.length"
      class="setting-content">
      <div class="setting-content-header">
        <Button
          @click="toggleAdvance">{{ isAdvancedShow ? '隐藏' : '显示' }}高级设置</Button>
        <Button
          :loading="loading"
          type="primary"
          class="setting-content-btn"
          @click="save">保存</Button>
      </div>
      <div
        class="setting-content-variable"
        :style="{'height': height - 40 + 'px'}">
        <variable
          v-for="(item, index) in fullTree"
          ref="variable"
          :key="index"
          :variable="item"
          @add-item="handleAdd"
          @remove-item="handleDelete"
          :un-valid-msg="unValidMsg"
          :is-advanced-show="isAdvancedShow"/>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import api from '@/js/service/api';
import Module from './index';
import variable from '@/js/component/variable';
export default {
    name: 'Setting',
    components: {
        variable,
    },
    mixins: [Module.mixin],
    props: {
        height: Number,
    },
    data() {
        return {
            menuList: [{
                name: '2',
                title: 'scriptis',
                icon: 'ios-people',
                children: [{
                    name: 'IDE-spark',
                    title: 'Spark',
                }, {
                    name: 'IDE-hive',
                    title: 'Hive',
                },
                {
                    name: 'IDE-python',
                    title: 'Python',
                }, {
                    name: 'IDE-pipeline',
                    title: 'importAndExport',
                }],
            }],
            activeMenu: '',
            fullTree: [],
            loading: false,
            unValidMsg: '',
            isAdvancedShow: false,
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.settingMenu.updateActiveName();
            this.getAppVariable('全局');
        });
    },
    methods: {
        getAppVariable(type) {
            this.activeMenu = type;
            const IDE = 'IDE';
            let appName = '通用设置';
            let creator = '通用设置';
            if (type.match(IDE)) {
                creator = IDE;
                appName = type.slice(IDE.length + 1, type.length);
            }
            api.fetch('/configuration/getFullTreesByAppName', {
                appName,
                creator,
            }, 'get').then((rst) => {
                this.loading = false;
                this.fullTree = rst.fullTree;
                this.fullTree.forEach((item) => {
                    item.settings = _.orderBy(item.settings, ['level'], ['asc']);
                });
            }).catch((err) => {
                this.loading = false;
            });
        },
        handleAdd(item, parent, cb) {
            setTimeout(() => {
                cb(true);
            }, 200);
        },
        handleDelete(item, parent, cb) {
            setTimeout(() => {
                cb(true);
            }, 200);
        },
        save() {
            this.loading = true;
            api.fetch('/configuration/saveFullTree', {
                fullTree: this.fullTree,
            }).then((rst) => {
                this.getAppVariable(this.activeMenu);
                this.unValidMsg = '';
                this.$Message.success('保存成功');
            }).catch((err) => {
                this.loading = false;
                this.unValidMsg = err.message;
            });
        },
        toggleAdvance() {
            this.isAdvancedShow = !this.isAdvancedShow;
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
