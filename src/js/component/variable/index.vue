<template>
  <div
    v-if="variable"
    class="we-variable">
    <div class="we-variable-header">
      <div>
        <div class="we-variable-header-title">
          <span>{{ variable.name }}</span>
          <span>({{ variable.settings.length }})</span>
        </div>
        <span
          class="we-variable-header-control"
          @click="handleControl">{{ controlLabel }}</span>
      </div>
    </div>
    <div
      v-show="!isHide"
      class="we-variable-content">
      <div
        v-for="(item, index) in variable.settings"
        :key="index"
        :title="item.description"
        class="we-variable-content-item"
        v-if="getItemIsShow(item)">
        <span class="we-variable-content-label-group">
          <span>{{ item.name }}</span>
          <span class="we-variable-content-label-key">[{{ item.key }}]</span>
        </span>
        <input
          v-model="item.value"
          :placeholder="item.defaultValue ? `默认值:${item.defaultValue}` : '无默认值'"
          type="text"
          class="we-variable-content-input"
          :class="{'un-valid': unValid && unValid.key === item.key}">
        <span
          v-if="unValid && unValid.key === item.key"
          class="we-warning-bar">{{ unValid.msg }}</span>
      </div>
    </div>
    <!--<div
      v-show="!isHide"
      class="we-variable-bottom">
      <div @click="add">
        <Icon
          type="ios-add"
          color="#2d8cf0"
          size="20"/>
        <span class="we-variable-bottom-add">新增变量</span>
      </div>
    </div>
    -->
  </div>
</template>
<script>
export default {
    props: {
        variable: Object,
        unValidMsg: String,
        isAdvancedShow: Boolean,
    },
    data() {
        return {
            isHide: false,
            controlLabel: '收起',
            unValid: null,
        };
    },
    watch: {
        unValidMsg(val, oldval) {
            this.setUnValidMsg(val);
        },
    },
    methods: {
        handleControl() {
            this.isHide = !this.isHide;
            this.controlLabel = this.isHide ? '展开' : '收起';
        },
        isNewAdd(item) {
            return item.hasOwnProperty('isNew');
        },
        add() {
        },
        handleOk(item) {
            this.$emit('add-item', item, this.variable, (flag) => {
                item.isNew = false;
            });
        },
        handleDelete(item) {
            this.$emit('remove-item', item, this.variable, (flag) => {
            });
        },
        setUnValidMsg(msg) {
            const key = msg.slice(msg.lastIndexOf(':') + 1, msg.indexOf('-'));
            const valid = msg.slice(msg.indexOf('['), msg.lastIndexOf(']') + 1);
            const value = msg.slice(msg.lastIndexOf('-') + 1, msg.length);
            const message = `值为${value}非法，取值范围是${valid}`;
            this.unValid = {
                key,
                msg: message,
            };
        },
        getItemIsShow(item) {
            if (item.hidden) {
                return !item.hidden;
            }
            if (item.advanced && this.isAdvancedShow) {
                return true;
            } else if (item.advanced && !this.isAdvancedShow) {
                return false;
            }
            return true;
        },
    },
};
</script>
<style lang="scss" src="./index.scss">

</style>
