<template>
  <div>
    <ul class="we-toolbar">
      <li
        @click="openPanel('log')">
        <Icon
          type="md-list-box"
          size="14"/>
        <span class="v-toolbar-icon">日志</span>
      </li>
    </ul>
  </div>
</template>
<script>
import module from '../index';
export default{
    mixins: [module.mixin],
    props: {
        status: String,
        application: String,
    },
    data() {
        return {
        };
    },
    methods: {
        openPanel(type) {
            this.$emit('open-panel', type);
        },
    },
};
</script>
