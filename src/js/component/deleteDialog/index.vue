<template>
  <Modal
    v-model="show"
    width="360"
    class-name="delete-modal">
    <p
      slot="header"
      class="delete-modal-header">
      <Icon type="ios-information-circle"/>
      <span>{{ label }}警告</span>
    </p>
    <div class="delete-modal-content">
      <p>
        <span>此操作将{{ label }}</span>
        <span class="delete-modal-content-type">{{ type }}</span>
        <span class="delete-modal-content-name">{{ name }}</span>
      </p>
      <p>是否继续？</p>
    </div>
    <div slot="footer">
      <Button
        :loading="loading"
        type="error"
        size="large"
        long
        @click="del">{{ ['引擎', '任务', '引擎和任务'].indexOf(type) !== -1 ? `结束${type}` : '删除' }}</Button>
    </div>
  </Modal>
</template>
<script>
export default {
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            show: false,
            type: '',
            name: '',
        };
    },
    computed: {
        label() {
            return ['引擎', '任务', '引擎和任务'].indexOf(this.type) !== -1 ? '结束该' : '删除';
        },
    },
    watch: {
        'loading': function(val) {
            if (!val) {
                this.show = false;
            }
        },
    },
    methods: {
        open(opt) {
            this.show = true;
            let { type, name } = opt;
            this.type = type;
            this.name = name;
        },
        close() {
            this.show = false;
        },
        del() {
            this.$emit('delete', this.type);
        },
    },
};
</script>
<style lang="scss" src="./index.scss">
</style>
