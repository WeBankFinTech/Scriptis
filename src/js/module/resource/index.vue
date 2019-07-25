<template>
  <Modal
    v-model="show"
    :width="780">
    <div slot="header">
      <span>资源管理器</span>
    </div>
    <slot
      v-if="show"
      ref="resource"/>
    <template slot="footer">
      <Button
        type="primary"
        @click="getExplorerInfo()">刷新</Button>
    </template>
  </Modal>
</template>
<script>
import Module from './index';
export default {
    name: 'ExplorerIndex',
    mixins: [Module.mixin],
    data() {
        return {
            show: false,
        };
    },
    activated() {
        this.getExplorerInfo();
    },
    methods: {
        // 显示页面
        open() {
            this.show = true;
        },

        // 关闭
        close() {
            this.show = false;
        },

        getExplorerInfo() {
            this.$refs.resource.getExplorerInfo();
        },
    },
};
</script>
