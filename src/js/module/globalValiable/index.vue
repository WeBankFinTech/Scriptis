<template>
  <div class="global-valiable">
    <Row class="global-valiable-control">
      <Button
        type="primary"
        @click="handleSubmit('formDynamic')"
        :loading="loading">{{ !isEdit ? '编辑' : '保存' }}</Button>
      <Button
        @click="handleCancel">取消</Button>
    </Row>
    <Form
      ref="formDynamic"
      :model="formDynamic"
      :label-width="100"
      class="global-valiable-form"
      :style="{'max-height': (height - 94) + 'px'}"
    >
      <FormItem
        v-for="(item, index) in formDynamic.items"
        :key="index"
        :label="'全局变量' + (index + 1) + '：'">
        <Row>
          <Col span="10">
          <FormItem
            :prop="'items.' + index + '.key'"
            :rules="[
              {required: true,message: `变量${index+1}的key为空`,trigger: 'blur'},
              {min: 1, max: 128, message: '长度超过128字符', trigger: 'change'},
              {pattern: /^[a-zA-z][^\s\u4e00-\u9fa5]*$/, message: '仅支持以字母开头，且不得存在空格和中文'},
              {validator:validateKey,trigger: 'blur'},
            ]">
            <Input
              v-model="item.key"
              type="text"
              placeholder="请输入变量名"
              :disabled="!isEdit"></Input>
          </FormItem>
          </Col>
          <Col
            span="1"
            class="global-valiable-tc">
          ：
          </Col>
          <Col span="10">
          <FormItem
            :prop="'items.' + index + '.value'"
            :rules="[{required: true, message: `变量${index+1}的value为空`, trigger: 'blur'},{min: 1, max: 128, message: '长度超过128字符', trigger: 'change'}]">
            <Input
              v-model="item.value"
              type="text"
              placeholder="请输入变量值"
              :disabled="!isEdit"></Input>
          </FormItem>
          </Col>
          <Col
            span="3"
            class="global-valiable-remove">
          <Button
            type="error"
            size="small"
            @click="handleRemove(item, index)"
            v-if="isEdit">移除</Button>
          </Col>
        </Row>
      </FormItem>
    </Form>
    <Row class="global-valiable-add">
      <Col span="12">
      <Button
        type="dashed"
        long
        icon="md-add"
        @click="handleAdd"
        v-if="isEdit">增加参数</Button>
      </Col>
    </Row>
    <div
      class="global-valiable-empty"
      :style="{'height': (height - 52) + 'px'}"
      v-if="!formDynamic.items.length">暂无全局变量数据</div>
    <detele-modal
      ref="killModal"
      :loading="loading"
      @delete="handleRemove"></detele-modal>
  </div>
</template>
<script>
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import module from './index';
import deteleModal from '@js/component/deleteDialog';
export default {
    components: {
        deteleModal,
    },
    mixins: [module.mixin],
    props: {
        height: Number,
    },
    data() {
        return {
            current: null,
            currentIndex: 0,
            formDynamic: {
                items: [],
            },
            loading: false,
            isEdit: false,
            validateKey: (rule, value, callback) => {
                const prop = rule.field;
                // 拿到当前编辑的item的index
                const current = prop.slice(prop.indexOf('.') + 1, prop.lastIndexOf('.'));
                // 必须当key相等，而且index不等的时候才是repeat
                const findRepeat = this.formDynamic.items.find((item, index) => {
                    return item.key === value && current != index;
                });
                if (findRepeat) {
                    callback(new Error('存在同名key'));
                }
                callback();
            },
        };
    },
    mounted() {
        this.getGlobalValiableList();
    },
    methods: {
        getGlobalValiableList() {
            api.fetch('/variable/listGlobalVariable', 'get').then((res) => {
                this.formDynamic.items = res.globalVariables.map((item, index) => {
                    return Object.assign(item);
                });
                if (storage.get('isGlobalVariableChange')) {
                    this.dispatch('IndexedDB:updateGlobalCache', {
                        id: this.getUserName(),
                        variableList: res.globalVariables,
                    });
                }
            });
        },
        handleSubmit(name) {
            if (this.isEdit) {
                if (this.formDynamic.items.length) {
                    this.$refs[name].validate((valid) => {
                        if (valid) {
                            this.save();
                        } else {
                            this.$Message.error('有验证项未通过，请检查后再试！');
                        }
                    });
                } else {
                    this.save();
                }
            } else {
                this.isEdit = true;
            }
        },
        save() {
            this.loading = true;
            api.fetch('/variable/saveGlobalVariable ', {
                globalVariables: this.formDynamic.items,
            }).then((res) => {
                this.loading = false;
                this.isEdit = false;
                this.$Message.success('全局变量更新成功！');
                this.getGlobalValiableList();
                storage.set('isGlobalVariableChange', true);
            }).catch((err) => {
                this.loading = false;
            });
        },
        handleAdd() {
            this.formDynamic.items.push({
                key: '',
                value: '',
            });
        },
        handleRemove(item, index) {
            this.formDynamic.items.splice(index, 1);
        },
        handleCancel() {
            this.isEdit = false;
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
